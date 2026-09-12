import { Router } from 'express';
import { TransactionsRepository } from '../repositories/transactions.repository.js';
import { TransactionIntelligenceService } from '../services/transactionIntelligence.service.js';
import { supabaseAdmin } from '../config/supabase.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
export function createTransactionsRouter() {
    const router = Router();
    const transactionsRepo = new TransactionsRepository();
    const intelligenceService = new TransactionIntelligenceService();
    // 1. Transaction Aggregated Intelligence & Metrics
    router.get('/metrics', requireAuth, requirePermission('transactions.view'), async (req, res) => {
        try {
            const metrics = await intelligenceService.calculateMetrics({
                vendorId: req.query.vendorId,
                category: req.query.category,
                fromDate: req.query.fromDate,
                toDate: req.query.toDate
            });
            res.json({
                success: true,
                data: metrics
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: { code: 'METRICS_FETCH_ERROR', message: err.message }
            });
        }
    });
    // 2. List Transactions with Search, Filters, Pagination
    router.get('/', requireAuth, requirePermission('transactions.view'), async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 50;
            const offset = (page - 1) * pageSize;
            let query = supabaseAdmin
                .from('transactions')
                .select('*, vendor:vendors(id, name, category, risk_level), invoice:invoices(id, invoice_number, status)', { count: 'exact' });
            if (req.query.search) {
                const s = req.query.search.trim();
                query = query.or(`transaction_reference.ilike.%${s}%,description.ilike.%${s}%`);
            }
            if (req.query.vendorId) {
                query = query.eq('vendor_id', req.query.vendorId);
            }
            if (req.query.type) {
                query = query.eq('transaction_type', req.query.type);
            }
            if (req.query.category) {
                query = query.eq('category', req.query.category);
            }
            if (req.query.status) {
                query = query.eq('status', req.query.status);
            }
            if (req.query.anomalyOnly === 'true') {
                query = query.eq('anomaly_flag', true);
            }
            if (req.query.fromDate) {
                query = query.gte('transaction_date', req.query.fromDate);
            }
            if (req.query.toDate) {
                query = query.lte('transaction_date', req.query.toDate);
            }
            if (req.query.minAmount) {
                query = query.gte('amount', parseFloat(req.query.minAmount));
            }
            if (req.query.maxAmount) {
                query = query.lte('amount', parseFloat(req.query.maxAmount));
            }
            const sortBy = req.query.sortBy || 'transaction_date';
            const sortOrder = req.query.sortOrder === 'asc' ? true : false;
            query = query
                .order(sortBy, { ascending: sortOrder })
                .range(offset, offset + pageSize - 1);
            const { data, count, error } = await query;
            if (error)
                throw error;
            res.json({
                success: true,
                data: {
                    transactions: data || [],
                    total: count || 0,
                    page,
                    pageSize,
                    totalPages: Math.ceil((count || 0) / pageSize) || 1
                }
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: { code: 'TRANSACTIONS_FETCH_ERROR', message: err.message }
            });
        }
    });
    // 3. Single Transaction Detail
    router.get('/:id', requireAuth, requirePermission('transactions.view'), async (req, res) => {
        try {
            const { data: txn, error } = await supabaseAdmin
                .from('transactions')
                .select('*, vendor:vendors(*), invoice:invoices(*), purchase_order:purchase_orders(*)')
                .eq('id', req.params.id)
                .maybeSingle();
            if (error || !txn) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Transaction record not found' }
                });
                return;
            }
            res.json({
                success: true,
                data: txn
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: { code: 'TRANSACTION_FETCH_ERROR', message: err.message }
            });
        }
    });
    return router;
}
