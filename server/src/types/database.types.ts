export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          role: 'ADMIN' | 'FINANCE_MANAGER' | 'FINANCE_ANALYST' | 'EMPLOYEE'
          department: string
          avatar_url: string | null
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          role: 'ADMIN' | 'FINANCE_MANAGER' | 'FINANCE_ANALYST' | 'EMPLOYEE'
          department?: string
          avatar_url?: string | null
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          role?: 'ADMIN' | 'FINANCE_MANAGER' | 'FINANCE_ANALYST' | 'EMPLOYEE'
          department?: string
          avatar_url?: string | null
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          id: string
          name: string
          tax_id: string | null
          category: string
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          risk_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          total_exposure: number
          status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'FLAGGED' | 'SUSPENDED'
          payment_terms: string
          historical_metrics: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          tax_id?: string | null
          category: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          total_exposure?: number
          status?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'FLAGGED' | 'SUSPENDED'
          payment_terms?: string
          historical_metrics?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          tax_id?: string | null
          category?: string
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          total_exposure?: number
          status?: 'ACTIVE' | 'PENDING_VERIFICATION' | 'FLAGGED' | 'SUSPENDED'
          payment_terms?: string
          historical_metrics?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          id: string
          po_number: string
          vendor_id: string
          department: string
          total_amount: number
          currency: string
          status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED'
          order_date: string
          expected_delivery: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          po_number: string
          vendor_id: string
          department: string
          total_amount: number
          currency?: string
          status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED'
          order_date?: string
          expected_delivery?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          po_number?: string
          vendor_id?: string
          department?: string
          total_amount?: number
          currency?: string
          status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED'
          order_date?: string
          expected_delivery?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          id: string
          purchase_order_id: string
          description: string
          quantity: number
          unit_price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          purchase_order_id: string
          description: string
          quantity?: number
          unit_price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          purchase_order_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          total?: number
          created_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          vendor_id: string
          purchase_order_id: string | null
          amount: number
          tax: number
          currency: string
          invoice_date: string
          due_date: string
          status: 'UPLOADED' | 'PROCESSING' | 'VALIDATED' | 'FLAGGED' | 'UNDER_REVIEW' | 'APPROVED' | 'ON_HOLD' | 'REJECTED' | 'PAID'
          payment_status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'HELD'
          risk_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          anomaly_status: 'NONE' | 'SUSPECTED' | 'CONFIRMED'
          duplicate_status: 'UNIQUE' | 'POTENTIAL_DUPLICATE' | 'CONFIRMED_DUPLICATE'
          document_path: string | null
          submitted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          vendor_id: string
          purchase_order_id?: string | null
          amount: number
          tax?: number
          currency?: string
          invoice_date: string
          due_date: string
          status?: 'UPLOADED' | 'PROCESSING' | 'VALIDATED' | 'FLAGGED' | 'UNDER_REVIEW' | 'APPROVED' | 'ON_HOLD' | 'REJECTED' | 'PAID'
          payment_status?: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'HELD'
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          anomaly_status?: 'NONE' | 'SUSPECTED' | 'CONFIRMED'
          duplicate_status?: 'UNIQUE' | 'POTENTIAL_DUPLICATE' | 'CONFIRMED_DUPLICATE'
          document_path?: string | null
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          vendor_id?: string
          purchase_order_id?: string | null
          amount?: number
          tax?: number
          currency?: string
          invoice_date?: string
          due_date?: string
          status?: 'UPLOADED' | 'PROCESSING' | 'VALIDATED' | 'FLAGGED' | 'UNDER_REVIEW' | 'APPROVED' | 'ON_HOLD' | 'REJECTED' | 'PAID'
          payment_status?: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'HELD'
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          anomaly_status?: 'NONE' | 'SUSPECTED' | 'CONFIRMED'
          duplicate_status?: 'UNIQUE' | 'POTENTIAL_DUPLICATE' | 'CONFIRMED_DUPLICATE'
          document_path?: string | null
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_line_items: {
        Row: {
          id: string
          invoice_id: string
          description: string
          quantity: number
          unit_price: number
          tax: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          description: string
          quantity?: number
          unit_price: number
          tax?: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          description?: string
          quantity?: number
          unit_price?: number
          tax?: number
          total?: number
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          transaction_reference: string
          vendor_id: string
          invoice_id: string | null
          purchase_order_id: string | null
          transaction_type: 'OUTFLOW' | 'INFLOW' | 'ADJUSTMENT' | 'HOLD_REVERSAL'
          category: string
          amount: number
          currency: string
          transaction_date: string
          status: 'PENDING' | 'CLEARED' | 'RECONCILED' | 'FLAGGED' | 'BLOCKED'
          risk_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          anomaly_flag: boolean
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          transaction_reference: string
          vendor_id: string
          invoice_id?: string | null
          purchase_order_id?: string | null
          transaction_type: 'OUTFLOW' | 'INFLOW' | 'ADJUSTMENT' | 'HOLD_REVERSAL'
          category: string
          amount: number
          currency?: string
          transaction_date?: string
          status?: 'PENDING' | 'CLEARED' | 'RECONCILED' | 'FLAGGED' | 'BLOCKED'
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          anomaly_flag?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          transaction_reference?: string
          vendor_id?: string
          invoice_id?: string | null
          purchase_order_id?: string | null
          transaction_type?: 'OUTFLOW' | 'INFLOW' | 'ADJUSTMENT' | 'HOLD_REVERSAL'
          category?: string
          amount?: number
          currency?: string
          transaction_date?: string
          status?: 'PENDING' | 'CLEARED' | 'RECONCILED' | 'FLAGGED' | 'BLOCKED'
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          anomaly_flag?: boolean
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          name: string
          department: string
          category: string
          allocated_amount: number
          spent_amount: number
          remaining_amount: number
          utilization: number
          period_start: string
          period_end: string
          status: 'ACTIVE' | 'NEAR_LIMIT' | 'EXCEEDED' | 'CLOSED'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          department: string
          category: string
          allocated_amount: number
          spent_amount?: number
          period_start: string
          period_end: string
          status?: 'ACTIVE' | 'NEAR_LIMIT' | 'EXCEEDED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          department?: string
          category?: string
          allocated_amount?: number
          spent_amount?: number
          period_start?: string
          period_end?: string
          status?: 'ACTIVE' | 'NEAR_LIMIT' | 'EXCEEDED' | 'CLOSED'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      investigations: {
        Row: {
          id: string
          investigation_id: string
          entity_type: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET' | 'PURCHASE_ORDER'
          entity_id: string
          title: string
          summary: string
          risk_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          status: 'OPEN' | 'INVESTIGATING' | 'AI_ANALYSIS' | 'AWAITING_REVIEW' | 'RESOLVED' | 'ESCALATED'
          recommendation: string | null
          confidence: number | null
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          investigation_id: string
          entity_type: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET' | 'PURCHASE_ORDER'
          entity_id: string
          title: string
          summary: string
          risk_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          status?: 'OPEN' | 'INVESTIGATING' | 'AI_ANALYSIS' | 'AWAITING_REVIEW' | 'RESOLVED' | 'ESCALATED'
          recommendation?: string | null
          confidence?: number | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          investigation_id?: string
          entity_type?: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET' | 'PURCHASE_ORDER'
          entity_id?: string
          title?: string
          summary?: string
          risk_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          status?: 'OPEN' | 'INVESTIGATING' | 'AI_ANALYSIS' | 'AWAITING_REVIEW' | 'RESOLVED' | 'ESCALATED'
          recommendation?: string | null
          confidence?: number | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      investigation_evidence: {
        Row: {
          id: string
          investigation_id: string
          evidence_type: 'DUPLICATE_HASH' | 'PO_MISMATCH' | 'BANK_ROUTING_CHANGE' | 'BUDGET_OVERRUN' | 'FREQUENCY_ANOMALY' | 'OCR_DISCREPANCY' | 'EXTERNAL_WATCHLIST'
          source_entity: string
          source_entity_id: string
          title: string
          description: string
          value: string
          significance: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          risk_contribution: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          investigation_id: string
          evidence_type: 'DUPLICATE_HASH' | 'PO_MISMATCH' | 'BANK_ROUTING_CHANGE' | 'BUDGET_OVERRUN' | 'FREQUENCY_ANOMALY' | 'OCR_DISCREPANCY' | 'EXTERNAL_WATCHLIST'
          source_entity: string
          source_entity_id: string
          title: string
          description: string
          value: string
          significance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          risk_contribution?: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          investigation_id?: string
          evidence_type?: 'DUPLICATE_HASH' | 'PO_MISMATCH' | 'BANK_ROUTING_CHANGE' | 'BUDGET_OVERRUN' | 'FREQUENCY_ANOMALY' | 'OCR_DISCREPANCY' | 'EXTERNAL_WATCHLIST'
          source_entity?: string
          source_entity_id?: string
          title?: string
          description?: string
          value?: string
          significance?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          risk_contribution?: number
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          id: string
          entity_type: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET'
          entity_id: string
          overall_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          component_scores: Json
          reasons: Json
          created_at: string
        }
        Insert: {
          id?: string
          entity_type: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET'
          entity_id: string
          overall_score: number
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          component_scores?: Json
          reasons?: Json
          created_at?: string
        }
        Update: {
          id?: string
          entity_type?: 'INVOICE' | 'TRANSACTION' | 'VENDOR' | 'BUDGET'
          entity_id?: string
          overall_score?: number
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          component_scores?: Json
          reasons?: Json
          created_at?: string
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          id: string
          investigation_id: string
          recommendation_type: 'APPROVE' | 'APPROVE_WITH_REVIEW' | 'HOLD' | 'REQUEST_INFORMATION' | 'REJECT' | 'ESCALATE' | 'INVESTIGATE_VENDOR'
          recommendation_text: string
          confidence: number
          reasoning_summary: string
          status: 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED'
          created_at: string
        }
        Insert: {
          id?: string
          investigation_id: string
          recommendation_type: 'APPROVE' | 'APPROVE_WITH_REVIEW' | 'HOLD' | 'REQUEST_INFORMATION' | 'REJECT' | 'ESCALATE' | 'INVESTIGATE_VENDOR'
          recommendation_text: string
          confidence: number
          reasoning_summary: string
          status?: 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED'
          created_at?: string
        }
        Update: {
          id?: string
          investigation_id?: string
          recommendation_type?: 'APPROVE' | 'APPROVE_WITH_REVIEW' | 'HOLD' | 'REQUEST_INFORMATION' | 'REJECT' | 'ESCALATE' | 'INVESTIGATE_VENDOR'
          recommendation_text?: string
          confidence?: number
          reasoning_summary?: string
          status?: 'PENDING' | 'ACCEPTED' | 'OVERRIDDEN' | 'REJECTED'
          created_at?: string
        }
        Relationships: []
      }
      workflow_tasks: {
        Row: {
          id: string
          task_id: string
          entity_type: string
          entity_id: string
          workflow_type: 'PAYMENT_HOLD' | 'FORENSIC_REVIEW' | 'VENDOR_REAUTHENTICATION' | 'BUDGET_OVERRIDE' | 'COMPLIANCE_SIGN_OFF'
          assigned_role: string
          assigned_user_id: string | null
          status: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED'
          priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          due_date: string | null
          source: string
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          task_id: string
          entity_type: string
          entity_id: string
          workflow_type: 'PAYMENT_HOLD' | 'FORENSIC_REVIEW' | 'VENDOR_REAUTHENTICATION' | 'BUDGET_OVERRIDE' | 'COMPLIANCE_SIGN_OFF'
          assigned_role?: string
          assigned_user_id?: string | null
          status?: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          due_date?: string | null
          source?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          entity_type?: string
          entity_id?: string
          workflow_type?: 'PAYMENT_HOLD' | 'FORENSIC_REVIEW' | 'VENDOR_REAUTHENTICATION' | 'BUDGET_OVERRIDE' | 'COMPLIANCE_SIGN_OFF'
          assigned_role?: string
          assigned_user_id?: string | null
          status?: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'ESCALATED' | 'CANCELLED'
          priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          due_date?: string | null
          source?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Relationships: []
      }
      approvals: {
        Row: {
          id: string
          approval_id: string
          entity_type: 'INVOICE' | 'PURCHASE_ORDER' | 'BUDGET_OVERRIDE' | 'PAYMENT_RELEASE'
          entity_id: string
          requester_id: string
          approver_id: string | null
          amount: number
          currency: string
          approval_level: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'EXECUTIVE'
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
          comments: string | null
          decision_timestamp: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          approval_id: string
          entity_type: 'INVOICE' | 'PURCHASE_ORDER' | 'BUDGET_OVERRIDE' | 'PAYMENT_RELEASE'
          entity_id: string
          requester_id: string
          approver_id?: string | null
          amount: number
          currency?: string
          approval_level?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'EXECUTIVE'
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
          comments?: string | null
          decision_timestamp?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          approval_id?: string
          entity_type?: 'INVOICE' | 'PURCHASE_ORDER' | 'BUDGET_OVERRIDE' | 'PAYMENT_RELEASE'
          entity_id?: string
          requester_id?: string
          approver_id?: string | null
          amount?: number
          currency?: string
          approval_level?: 'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3' | 'EXECUTIVE'
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED'
          comments?: string | null
          decision_timestamp?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      escalations: {
        Row: {
          id: string
          entity_type: string
          entity_id: string
          reason: string
          severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          assigned_to: string | null
          status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
          comments: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          entity_type: string
          entity_id: string
          reason: string
          severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          assigned_to?: string | null
          status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
          comments?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          entity_type?: string
          entity_id?: string
          reason?: string
          severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
          assigned_to?: string | null
          status?: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED'
          comments?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          id: string
          alert_type: 'BUDGET_BREACH' | 'SUSPICIOUS_PAYMENT' | 'BANK_CHANGE' | 'DUPLICATE_INVOICE' | 'VELOCITY_SPIKE' | 'SYSTEM_AUDIT'
          severity: 'INFO' | 'WARNING' | 'CRITICAL'
          title: string
          description: string
          entity: string
          entity_id: string | null
          status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
          read_state: boolean
          route: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          alert_type: 'BUDGET_BREACH' | 'SUSPICIOUS_PAYMENT' | 'BANK_CHANGE' | 'DUPLICATE_INVOICE' | 'VELOCITY_SPIKE' | 'SYSTEM_AUDIT'
          severity?: 'INFO' | 'WARNING' | 'CRITICAL'
          title: string
          description: string
          entity: string
          entity_id?: string | null
          status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
          read_state?: boolean
          route?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          alert_type?: 'BUDGET_BREACH' | 'SUSPICIOUS_PAYMENT' | 'BANK_CHANGE' | 'DUPLICATE_INVOICE' | 'VELOCITY_SPIKE' | 'SYSTEM_AUDIT'
          severity?: 'INFO' | 'WARNING' | 'CRITICAL'
          title?: string
          description?: string
          entity?: string
          entity_id?: string | null
          status?: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
          read_state?: boolean
          route?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          id: string
          report_name: string
          report_type: 'FINANCIAL_SUMMARY' | 'RISK_REPORT' | 'VENDOR_RISK_REPORT' | 'BUDGET_REPORT' | 'ANOMALY_REPORT' | 'INVESTIGATION_REPORT'
          reporting_period: string
          generated_by: string | null
          status: 'GENERATING' | 'COMPLETED' | 'FAILED'
          storage_path: string | null
          file_size: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          report_name: string
          report_type: 'FINANCIAL_SUMMARY' | 'RISK_REPORT' | 'VENDOR_RISK_REPORT' | 'BUDGET_REPORT' | 'ANOMALY_REPORT' | 'INVESTIGATION_REPORT'
          reporting_period: string
          generated_by?: string | null
          status?: 'GENERATING' | 'COMPLETED' | 'FAILED'
          storage_path?: string | null
          file_size?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          report_name?: string
          report_type?: 'FINANCIAL_SUMMARY' | 'RISK_REPORT' | 'VENDOR_RISK_REPORT' | 'BUDGET_REPORT' | 'ANOMALY_REPORT' | 'INVESTIGATION_REPORT'
          reporting_period?: string
          generated_by?: string | null
          status?: 'GENERATING' | 'COMPLETED' | 'FAILED'
          storage_path?: string | null
          file_size?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_name: string
          user_role: string
          action: string
          entity_type: string
          entity_id: string
          previous_state: Json | null
          new_state: Json | null
          reason: string | null
          source: string
          workflow_reference: string | null
          timestamp: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_name: string
          user_role: string
          action: string
          entity_type: string
          entity_id: string
          previous_state?: Json | null
          new_state?: Json | null
          reason?: string | null
          source?: string
          workflow_reference?: string | null
          timestamp?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_name?: string
          user_role?: string
          action?: string
          entity_type?: string
          entity_id?: string
          previous_state?: Json | null
          new_state?: Json | null
          reason?: string | null
          source?: string
          workflow_reference?: string | null
          timestamp?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
