import { NextResponse } from 'next/server';
import { checkSetupStatus, validateDatabaseConnection, getDatabaseStatus } from '@/lib/setup';

export async function GET() {
  try {
    const dbStatus = getDatabaseStatus();

    if (!dbStatus.configured) {
      return NextResponse.json(
        {
          isInitialized: false,
          tablesCreated: false,
          adminExists: false,
          setupStep: 'check',
          error: 'DATABASE_URL not configured',
          dbConfigured: false,
        },
        { status: 200 }
      );
    }

    const connectionValid = await validateDatabaseConnection();

    if (!connectionValid) {
      return NextResponse.json(
        {
          isInitialized: false,
          tablesCreated: false,
          adminExists: false,
          setupStep: 'check',
          error: 'Cannot connect to database',
          dbConfigured: true,
          connectionValid: false,
        },
        { status: 200 }
      );
    }

    const status = await checkSetupStatus();

    return NextResponse.json({
      ...status,
      dbConfigured: true,
      connectionValid: true,
    });
  } catch (error) {
    console.error('[Setup API] Status check error:', error);
    return NextResponse.json(
      {
        isInitialized: false,
        tablesCreated: false,
        adminExists: false,
        setupStep: 'check',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
