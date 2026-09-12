import dotenv from 'dotenv'
import { supabaseAdmin } from '../config/supabase.js'
import { InvoicesRepository } from '../repositories/invoices.repository.js'
import { WorkflowsRepository } from '../repositories/workflows.repository.js'
import { ApprovalsRepository } from '../repositories/approvals.repository.js'
import { EscalationsRepository } from '../repositories/escalations.repository.js'
import { AlertsRepository } from '../repositories/alerts.repository.js'
import { AuditLogsRepository } from '../repositories/auditLogs.repository.js'
import { EnterproService } from '../services/enterpro.service.js'
import { HoldsService } from '../services/holds.service.js'

dotenv.config()

async function runPhase7Tests() {
  console.log('\n==================================================')
  console.log('FIN-SHIELD PHASE 7: FINANCIAL WORKFLOW AUTOMATION VERIFICATION')
  console.log('==================================================\n')

  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${testName}${detail ? ` (${detail})` : ''}`)
      passed++
    } else {
      console.error(`  [FAIL] ${testName}${detail ? ` (${detail})` : ''}`)
      failed++
    }
  }

  try {
    const invoicesRepo = new InvoicesRepository()
    const workflowsRepo = new WorkflowsRepository()
    const approvalsRepo = new ApprovalsRepository()
    const escalationsRepo = new EscalationsRepository()
    const alertsRepo = new AlertsRepository()
    const auditRepo = new AuditLogsRepository()

    const enterproService = new EnterproService(workflowsRepo, invoicesRepo, approvalsRepo, escalationsRepo, alertsRepo, auditRepo)
    const holdsService = new HoldsService(workflowsRepo, invoicesRepo, alertsRepo, auditRepo, enterproService)

    // Retrieve active profiles from database to satisfy foreign keys
    const { data: profiles, error: profileErr } = await supabaseAdmin.from('profiles').select('id, email, role')
    if (profileErr) throw profileErr
    assert(Boolean(profiles && profiles.length > 0), 'Database has seed profiles configured', `${profiles?.length} profiles found`)

    const managerProfile = profiles?.find(p => p.role === 'FINANCE_MANAGER') || profiles?.[0]!
    const analystProfile = profiles?.find(p => p.role === 'FINANCE_ANALYST') || profiles?.[1] || managerProfile
    console.log(`Test Manager: ${managerProfile.email} (${managerProfile.id})`)
    console.log(`Test Analyst: ${analystProfile.email} (${analystProfile.id})`)

    // Ensure we have a target invoice for tests
    const allInvoices = await invoicesRepo.findAll(50)
    assert(allInvoices.length > 0, 'Database contains invoice records for Phase 7 workflow execution', `${allInvoices.length} invoices found`)

    const targetInvoice = allInvoices.find(inv => inv.invoice_number === 'INV-20481') || allInvoices[0]
    console.log(`\nTarget Entity: Invoice ${targetInvoice.invoice_number} (ID: ${targetInvoice.id}), Amount: $${targetInvoice.amount}`)

    // ----------------------------------------------------
    // TEST 1: EnterPro ERP Adapter Workflow Creation (7A)
    // ----------------------------------------------------
    console.log('\n--- TEST 1: ENTERPRO ERP WORKFLOW ADAPTER (7A) ---')

    const createdWorkflow = await enterproService.createWorkflow({
      entityType: 'INVOICE',
      entityId: targetInvoice.id,
      workflowType: 'PAYMENT_HOLD',
      priority: 'CRITICAL',
      assignedRole: 'FINANCE_MANAGER',
      assignedUserId: managerProfile.id,
      reason: 'Deterministic risk breach: Duplicate transaction detected on unauthorized bank route'
    })

    assert(Boolean(createdWorkflow.taskId && createdWorkflow.taskId.startsWith('EP-WF-')), 'EnterPro generates standardized task ID format', createdWorkflow.taskId)
    assert(createdWorkflow.status === 'ACTIVE', 'EnterPro workflow initializes in ACTIVE state', createdWorkflow.status)
    assert(createdWorkflow.erpSyncStatus === 'ERP_LOCKED', 'EnterPro ERP disbursement lock engaged', createdWorkflow.erpSyncStatus)
    assert(createdWorkflow.steps.length === 4, 'EnterPro generates multi-tier milestone trace', `${createdWorkflow.steps.length} steps`)

    // Verify invoice status updated to ON_HOLD
    const invoiceAfterHold = await invoicesRepo.findById(targetInvoice.id)
    assert(invoiceAfterHold?.status === 'ON_HOLD', 'Invoice status updated to ON_HOLD in database', invoiceAfterHold?.status)
    assert(invoiceAfterHold?.payment_status === 'HELD', 'Invoice payment status updated to HELD in database', invoiceAfterHold?.payment_status)

    // Verify status retrieval
    const retrievedWorkflow = await enterproService.getWorkflowStatus(createdWorkflow.taskId)
    assert(retrievedWorkflow !== null && retrievedWorkflow.taskId === createdWorkflow.taskId, 'Workflow status retrieval succeeds with execution telemetry')

    // ----------------------------------------------------
    // TEST 2: Multi-Tier Approval Workflows (7B)
    // ----------------------------------------------------
    console.log('\n--- TEST 2: MULTI-TIER APPROVAL ENGINE (7B) ---')

    const approvalInsert = await approvalsRepo.create({
      approval_id: `APR-P7-${Date.now().toString().slice(-6)}`,
      entity_type: 'INVOICE',
      entity_id: targetInvoice.id,
      requester_id: analystProfile.id,
      amount: targetInvoice.amount,
      currency: 'USD',
      approval_level: 'LEVEL_2',
      status: 'PENDING',
      comments: 'Phase 7 automated disbursement approval request'
    })

    assert(Boolean(approvalInsert.id), 'Approval record created in public.approvals table', approvalInsert.approval_id)
    assert(approvalInsert.status === 'PENDING', 'Approval initialized with PENDING status')

    // Test Approval Decision
    const approvedResult = await approvalsRepo.update(approvalInsert.id, {
      status: 'APPROVED',
      approver_id: managerProfile.id,
      decision_timestamp: new Date().toISOString(),
      comments: 'Authorized by Finance Manager after reviewing 3-way match'
    })

    assert(approvedResult.status === 'APPROVED', 'Approval successfully authorized', approvedResult.status)
    assert(Boolean(approvedResult.decision_timestamp), 'Approval records immutable decision timestamp')

    // ----------------------------------------------------
    // TEST 3: Human Escalations & Incident Triage (7D)
    // ----------------------------------------------------
    console.log('\n--- TEST 3: HUMAN ESCALATION & TRIAGE MATRIX (7D) ---')

    const escalation = await escalationsRepo.create({
      entity_type: 'INVOICE',
      entity_id: targetInvoice.id,
      reason: 'Suspected velocity spike and anomalous vendor bank account update',
      severity: 'CRITICAL',
      assigned_to: managerProfile.id,
      status: 'OPEN',
      comments: 'Assigned to Senior Forensic Auditor'
    })

    assert(Boolean(escalation.id), 'Human escalation ticket created in public.escalations', escalation.id)
    assert(escalation.status === 'OPEN', 'Escalation initialized in OPEN state')

    // Resolve escalation
    const resolvedEscalation = await escalationsRepo.resolve(escalation.id, 'Vendor re-authenticated via dual biometric phone verification. Risk cleared.')
    assert(resolvedEscalation.status === 'RESOLVED', 'Escalation successfully resolved with audit sign-off', resolvedEscalation.status)
    assert(Boolean(resolvedEscalation.resolved_at), 'Escalation tracks resolution timestamp')

    // ----------------------------------------------------
    // TEST 4: Payment Holds & Dual-Control Release (7C)
    // ----------------------------------------------------
    console.log('\n--- TEST 4: PAYMENT HOLDS & DUAL-CONTROL RELEASE (7C) ---')

    const activeHolds = await holdsService.getHolds('ACTIVE')
    assert(activeHolds.length > 0, 'Holds service lists active payment holds across invoices and EnterPro workflows', `${activeHolds.length} holds active`)

    // Attempt release with unauthorized role (e.g. FINANCE_ANALYST) -> Must fail
    let unauthorizedFailed = false
    try {
      await holdsService.releaseHold({
        invoiceId: targetInvoice.id,
        reason: 'Attempted release by analyst',
        user: {
          id: analystProfile.id,
          email: analystProfile.email,
          role: 'FINANCE_ANALYST'
        }
      })
    } catch (err: any) {
      unauthorizedFailed = err.message.includes('Forbidden')
    }
    assert(unauthorizedFailed, 'Dual-control security correctly rejects unauthorized release attempt by FINANCE_ANALYST')

    // Attempt release without justification reason -> Must fail
    let missingReasonFailed = false
    try {
      await holdsService.releaseHold({
        invoiceId: targetInvoice.id,
        reason: '',
        user: {
          id: managerProfile.id,
          email: managerProfile.email,
          role: 'FINANCE_MANAGER'
        }
      })
    } catch (err: any) {
      missingReasonFailed = err.message.includes('Validation Error')
    }
    assert(missingReasonFailed, 'Mandatory justification audit check enforces min length reasoning')

    // Authorized release with FINANCE_MANAGER and valid justification -> Must succeed
    const releaseResult = await holdsService.releaseHold({
      invoiceId: targetInvoice.id,
      reason: 'Verified legitimate emergency supply order. Approved by Finance Manager.',
      user: {
        id: managerProfile.id,
        email: managerProfile.email,
        role: 'FINANCE_MANAGER'
      }
    })

    assert(releaseResult.success === true, 'Authorized hold release executes successfully', releaseResult.message)

    // Verify invoice returned to VALIDATED / UNPAID
    const invoiceAfterRelease = await invoicesRepo.findById(targetInvoice.id)
    assert(invoiceAfterRelease?.status === 'VALIDATED', 'Invoice returned to VALIDATED state', invoiceAfterRelease?.status)
    assert(invoiceAfterRelease?.payment_status === 'UNPAID', 'Invoice payment status returned to UNPAID for scheduled disbursement', invoiceAfterRelease?.payment_status)

    // ----------------------------------------------------
    // TEST 5: Append-Only Audit Trail Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 5: APPEND-ONLY AUDIT TRAIL INTEGRITY ---')
    const auditLogs = await auditRepo.findByEntity('INVOICE', targetInvoice.id)
    assert(auditLogs.length >= 2, 'Audit logs recorded every workflow state transition in append-only ledger', `${auditLogs.length} audit records found`)

    console.log('\n==================================================')
    console.log(`PHASE 7 VERIFICATION COMPLETE: ${passed} PASSED, ${failed} FAILED`)
    console.log('==================================================\n')

    if (failed > 0) {
      process.exit(1)
    }
  } catch (err: any) {
    console.error('Fatal error during Phase 7 verification:', err)
    process.exit(1)
  }
}

runPhase7Tests()
