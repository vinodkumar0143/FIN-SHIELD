import { supabaseAdmin } from '../config/supabase.js';
export class DuplicateDetectionService {
    client;
    constructor(client = supabaseAdmin) {
        this.client = client;
    }
    normalizeInvoiceNumber(num) {
        return num.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    }
    levenshteinDistance(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }
    async checkDuplicates(params) {
        const { excludeInvoiceId, vendorId, invoiceNumber, amount, invoiceDate, poId } = params;
        // Fetch existing invoices for this vendor
        let query = this.client
            .from('invoices')
            .select('*')
            .eq('vendor_id', vendorId);
        if (excludeInvoiceId) {
            query = query.neq('id', excludeInvoiceId);
        }
        const { data: existingInvoices, error } = await query;
        if (error || !existingInvoices || existingInvoices.length === 0) {
            return {
                duplicateStatus: 'UNIQUE',
                confidenceScore: 0,
                matchingInvoiceIds: [],
                matchingInvoices: [],
                evidence: []
            };
        }
        const currentNormalized = this.normalizeInvoiceNumber(invoiceNumber);
        const currentDate = new Date(invoiceDate).getTime();
        const matchingInvoices = [];
        const evidence = [];
        let maxConfidence = 0;
        for (const inv of existingInvoices) {
            const invNormalized = this.normalizeInvoiceNumber(inv.invoice_number);
            const invDate = new Date(inv.invoice_date).getTime();
            const daysDiff = Math.abs(currentDate - invDate) / (1000 * 60 * 60 * 24);
            const amountDiff = Math.abs(inv.amount - amount);
            const reasons = [];
            let similarityScore = 0;
            // Check 1: Exact Normalized Invoice Number Match
            if (currentNormalized === invNormalized) {
                similarityScore = 100;
                reasons.push(`Identical normalized invoice number (${inv.invoice_number})`);
                evidence.push({
                    rule: 'EXACT_INVOICE_NUMBER_MATCH',
                    description: `Invoice ${invoiceNumber} matches existing invoice ${inv.invoice_number} under identical vendor account.`,
                    severity: 'CRITICAL'
                });
            }
            // Check 2: Near Invoice Number (Levenshtein distance <= 2)
            const distance = this.levenshteinDistance(currentNormalized, invNormalized);
            if (distance > 0 && distance <= 2) {
                similarityScore = Math.max(similarityScore, 85);
                reasons.push(`Highly similar invoice number (edit distance: ${distance} from ${inv.invoice_number})`);
                evidence.push({
                    rule: 'SIMILAR_INVOICE_NUMBER',
                    description: `Invoice number "${invoiceNumber}" is near-identical to "${inv.invoice_number}" (Levenshtein distance ${distance}).`,
                    severity: 'WARNING'
                });
            }
            // Check 3: Identical Amount in close temporal window (<= 60 days)
            if (amountDiff <= 0.01 && daysDiff <= 60) {
                const score = daysDiff <= 14 ? 90 : 75;
                similarityScore = Math.max(similarityScore, score);
                reasons.push(`Identical monetary amount (₹${amount.toLocaleString('en-IN')}) within ${Math.round(daysDiff)} days of ${inv.invoice_number}`);
                evidence.push({
                    rule: 'TEMPORAL_AMOUNT_CORRELATION',
                    description: `Identical amount ₹${amount.toLocaleString('en-IN')} submitted within ${Math.round(daysDiff)} days of ${inv.invoice_number} (dated ${inv.invoice_date}).`,
                    severity: daysDiff <= 14 ? 'CRITICAL' : 'WARNING'
                });
            }
            // Check 4: Same PO Number already billed
            if (poId && inv.purchase_order_id && poId === inv.purchase_order_id) {
                similarityScore = Math.max(similarityScore, 65);
                reasons.push(`Reuses same Purchase Order reference (${poId}) already billed by ${inv.invoice_number}`);
                evidence.push({
                    rule: 'DUPLICATE_PO_CONSUMPTION',
                    description: `Multiple invoices targeting identical Purchase Order ID ${poId}.`,
                    severity: 'WARNING'
                });
            }
            if (similarityScore > 0) {
                maxConfidence = Math.max(maxConfidence, similarityScore);
                matchingInvoices.push({
                    id: inv.id,
                    invoiceNumber: inv.invoice_number,
                    amount: inv.amount,
                    currency: inv.currency,
                    invoiceDate: inv.invoice_date,
                    status: inv.status,
                    similarityScore,
                    matchReasons: reasons
                });
            }
        }
        let duplicateStatus = 'UNIQUE';
        if (maxConfidence >= 90) {
            duplicateStatus = 'CONFIRMED_DUPLICATE';
        }
        else if (maxConfidence >= 60) {
            duplicateStatus = 'POTENTIAL_DUPLICATE';
        }
        return {
            duplicateStatus,
            confidenceScore: maxConfidence,
            matchingInvoiceIds: matchingInvoices.map(m => m.id),
            matchingInvoices,
            evidence
        };
    }
}
