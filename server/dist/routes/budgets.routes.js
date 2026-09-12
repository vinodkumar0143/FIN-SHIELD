import { Router } from 'express';
import { BudgetMonitoringService } from '../services/budgetMonitoring.service.js';
import { requireAuth, requirePermission } from '../middleware/auth.middleware.js';
export function createBudgetsRouter() {
    const router = Router();
    const monitoringService = new BudgetMonitoringService();
    // 1. List Budgets with Computed Utilization & Health Statuses
    router.get('/', requireAuth, requirePermission('budgets.view'), async (_req, res) => {
        try {
            const budgets = await monitoringService.getAllBudgets();
            res.json({
                success: true,
                data: budgets
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: { code: 'BUDGETS_FETCH_ERROR', message: err.message }
            });
        }
    });
    // 2. Budget Detail with Impacting Transactions & Invoices
    router.get('/:id', requireAuth, requirePermission('budgets.view'), async (req, res) => {
        try {
            const budget = await monitoringService.getBudgetById(req.params.id);
            if (!budget) {
                res.status(404).json({
                    success: false,
                    error: { code: 'NOT_FOUND', message: 'Budget record not found' }
                });
                return;
            }
            res.json({
                success: true,
                data: budget
            });
        }
        catch (err) {
            res.status(500).json({
                success: false,
                error: { code: 'BUDGET_FETCH_ERROR', message: err.message }
            });
        }
    });
    return router;
}
