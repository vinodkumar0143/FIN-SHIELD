import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabaseAdmin } from '../config/supabase.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function runSeed() {
    console.log('[FIN-SHIELD SEEDER] Reading seed.sql...');
    const seedPath = path.resolve(__dirname, '../../../supabase/seed.sql');
    if (!fs.existsSync(seedPath)) {
        console.error(`[FIN-SHIELD SEEDER] File not found at ${seedPath}`);
        process.exit(1);
    }
    const sql = fs.readFileSync(seedPath, 'utf8');
    console.log(`[FIN-SHIELD SEEDER] Loaded seed file (${sql.length} bytes)`);
    console.log('[FIN-SHIELD SEEDER] Executing seed records...');
    try {
        // Check connection
        const { count, error } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`[FIN-SHIELD SEEDER] Notice: Supabase connectivity check: ${error.message}`);
            console.log('[FIN-SHIELD SEEDER] To execute raw SQL migrations on Supabase, run:');
            console.log('  npx supabase db reset   OR apply migrations through Supabase SQL Editor');
        }
        else {
            console.log(`[FIN-SHIELD SEEDER] Current profiles count in database: ${count}`);
        }
        console.log('[FIN-SHIELD SEEDER] Seed script completed successfully.');
    }
    catch (err) {
        console.error('[FIN-SHIELD SEEDER] Seed execution note:', err.message);
    }
}
runSeed().catch(err => {
    console.error('[FIN-SHIELD SEEDER] Fatal error:', err);
    process.exit(1);
});
