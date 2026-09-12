import dotenv from 'dotenv';
import { supabaseAdmin, supabaseAnon } from '../config/supabase.js';
import { ROLE_PERMISSIONS, hasPermission } from '../lib/permissions.js';
dotenv.config();
const TEST_USERS = [
    { email: 'admin@finshield.ai', role: 'ADMIN', name: 'Dr. Evelyn Vance' },
    { email: 'marcus.s@finshield.ai', role: 'FINANCE_MANAGER', name: 'Marcus Sterling' },
    { email: 'sarah.c@finshield.ai', role: 'FINANCE_ANALYST', name: 'Sarah Chen' },
    { email: 'ananya.r@finshield.ai', role: 'EMPLOYEE', name: 'Ananya Roy' }
];
async function runAuthRbacTests() {
    console.log('====================================================');
    console.log('🛡️  FIN-SHIELD PHASE 3: AUTH & RBAC VERIFICATION SUITE');
    console.log('====================================================\n');
    let passedCount = 0;
    let failedCount = 0;
    // 1. Verify Permission Matrix
    console.log('1️⃣ Verifying Centralized RBAC Permission Matrix...');
    try {
        // Admin checks
        if (!hasPermission('ADMIN', 'users.manage'))
            throw new Error('Admin missing users.manage');
        if (!hasPermission('ADMIN', 'invoices.delete'))
            throw new Error('Admin missing invoices.delete');
        if (!hasPermission('ADMIN', 'audit.view'))
            throw new Error('Admin missing audit.view');
        // Finance Manager checks
        if (!hasPermission('FINANCE_MANAGER', 'invoices.approve'))
            throw new Error('FM missing invoices.approve');
        if (hasPermission('FINANCE_MANAGER', 'users.manage'))
            throw new Error('FM should not have users.manage');
        // Finance Analyst checks
        if (!hasPermission('FINANCE_ANALYST', 'investigations.create'))
            throw new Error('FA missing investigations.create');
        if (hasPermission('FINANCE_ANALYST', 'invoices.delete'))
            throw new Error('FA should not have invoices.delete');
        if (hasPermission('FINANCE_ANALYST', 'users.view'))
            throw new Error('FA should not have users.view');
        // Employee checks
        if (!hasPermission('EMPLOYEE', 'invoices.upload'))
            throw new Error('Employee missing invoices.upload');
        if (hasPermission('EMPLOYEE', 'audit.view'))
            throw new Error('Employee should not have audit.view');
        if (hasPermission('EMPLOYEE', 'vendors.manage'))
            throw new Error('Employee should not have vendors.manage');
        console.log('✅ RBAC Permission Matrix rules strictly verified for all 4 roles!');
        passedCount++;
    }
    catch (err) {
        console.error('❌ RBAC Matrix Failure:', err.message);
        failedCount++;
    }
    // 2. Verify Supabase Profiles Resolution
    console.log('\n2️⃣ Testing Supabase Auth & Profile Linking for All 4 Roles...');
    for (const tUser of TEST_USERS) {
        try {
            // Query profiles table for each user
            const { data: profile, error } = await supabaseAdmin
                .from('profiles')
                .select('*')
                .eq('email', tUser.email)
                .single();
            if (error || !profile) {
                throw new Error(`Profile not found for ${tUser.email}: ${error?.message}`);
            }
            if (profile.role !== tUser.role) {
                throw new Error(`Role mismatch for ${tUser.email}: Expected ${tUser.role}, got ${profile.role}`);
            }
            const assignedPerms = ROLE_PERMISSIONS[profile.role] || [];
            console.log(`✅ [${profile.role}] ${profile.full_name} (${profile.email}): Profile matched, ${assignedPerms.length} permissions mapped.`);
            passedCount++;
        }
        catch (err) {
            console.error(`❌ Profile Verification failed for ${tUser.email}:`, err.message);
            failedCount++;
        }
    }
    // 3. Test Invalid Token Rejection
    console.log('\n3️⃣ Testing Invalid Bearer Token Security Boundary...');
    try {
        const { data, error } = await supabaseAnon.auth.getUser('invalid-token-xyz-123');
        if (error || !data.user) {
            console.log('✅ Unauthorized token rejected by Supabase Auth security boundary.');
            passedCount++;
        }
        else {
            throw new Error('Invalid token was unexpectedly accepted!');
        }
    }
    catch (err) {
        console.error('❌ Token security test failed:', err.message);
        failedCount++;
    }
    console.log('\n====================================================');
    console.log(`📊 RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
    console.log('====================================================');
    if (failedCount > 0) {
        process.exit(1);
    }
}
runAuthRbacTests();
