import { createApp } from './app.js';
const PORT = process.env.PORT || 5000;
const app = createApp();
app.listen(PORT, () => {
    console.log(`[FIN-SHIELD] Server listening on port ${PORT}`);
    console.log(`[FIN-SHIELD] Supabase PostgreSQL Data Layer active`);
});
