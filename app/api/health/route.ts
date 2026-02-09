import { NextResponse } from 'next/server';
import { validateDatabaseConnection, checkSetupStatus } from '@/lib/setup';

export async function GET() {
  try {
    const dbConnected = await validateDatabaseConnection();
    const setupStatus = await checkSetupStatus();

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: {
        connected: dbConnected,
        initialized: setupStatus.isInitialized,
        tablesCreated: setupStatus.tablesCreated,
        adminExists: setupStatus.adminExists,
      },
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('[Health Check] Error:', error);
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Health check failed',
      },
      { status: 500 }
    );
  }
}
