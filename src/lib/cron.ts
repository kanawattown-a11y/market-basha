// Cron Jobs Configuration for Market Basha
// This file sets up scheduled tasks for system maintenance

import { cleanupOldAuditLogs } from './audit';

/**
 * Run audit log cleanup weekly
 * Keeps last 90 days of logs by default
 */
export async function scheduleAuditLogCleanup() {
    try {
        console.log('[CRON] Running audit log cleanup...');
        const deletedCount = await cleanupOldAuditLogs(90);
        console.log(`[CRON] Deleted ${deletedCount} old audit log entries`);
        return { success: true, deletedCount };
    } catch (error) {
        console.error('[CRON] Audit log cleanup failed:', error);
        return { success: false, error };
    }
}

/**
 * Initialize all cron jobs
 * Call this from a cron service or scheduled task runner
 */
export async function initializeCronJobs() {
    console.log('[CRON] Initializing scheduled jobs...');

    // Run cleanup immediately on startup (optional)
    // await scheduleAuditLogCleanup();

    // Note: Actual scheduling should be done via:
    // 1. Vercel Cron (if hosted on Vercel)
    // 2. node-cron package (for custom hosting)
    // 3. Server cron jobs (for VPS/dedicated)

    console.log('[CRON] Jobs initialized');
}

// Example for node-cron (uncomment if using):
// import cron from 'node-cron';
// export function startCronSchedule() {
//     // Run every Sunday at 2 AM
//     cron.schedule('0 2 * * 0', scheduleAuditLogCleanup);
// }
