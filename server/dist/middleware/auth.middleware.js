import { supabaseAdmin } from '../config/supabase.js';
import { hasPermission } from '../lib/permissions.js';
/**
 * Validates the Supabase Bearer token from the Authorization header.
 * Resolves the authenticated user's profile and application role.
 * Never trusts a role value sent directly by the frontend.
 */
export async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Missing or malformed Authorization header with Bearer token'
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid, expired, or revoked Supabase session token'
            });
            return;
        }
        // Resolve user's actual profile and role directly from PostgreSQL
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();
        const role = profile?.role || 'EMPLOYEE';
        req.user = {
            id: user.id,
            email: user.email || profile?.email || '',
            role,
            profile: profile || undefined
        };
        next();
    }
    catch (err) {
        console.error('[FIN-SHIELD AUTH MIDDLEWARE] Token verification failure:', err.message);
        res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication processing failure'
        });
    }
}
/**
 * Enforces that the authenticated user possesses one of the allowed roles.
 */
export function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Insufficient role clearance. Required one of: [${allowedRoles.join(', ')}]`,
                currentRole: req.user.role
            });
            return;
        }
        next();
    };
}
/**
 * Enforces that the authenticated user's role has the required permission.
 */
export function requirePermission(...permissions) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
            return;
        }
        const hasAll = permissions.every(p => hasPermission(req.user?.role, p));
        if (!hasAll) {
            res.status(403).json({
                error: 'Forbidden',
                message: `Access denied. Missing required clearance: [${permissions.join(', ')}]`,
                currentRole: req.user.role
            });
            return;
        }
        next();
    };
}
