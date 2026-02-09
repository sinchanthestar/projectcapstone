'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, AlertCircle, Database, Lock, Users } from 'lucide-react';

interface SetupStatus {
  isInitialized: boolean;
  tablesCreated: boolean;
  adminExists: boolean;
  setupStep: string;
  dbConfigured?: boolean;
  connectionValid?: boolean;
  error?: string;
}

export function SetupWizard() {
  const router = useRouter();
  const [status, setStatus] = useState<SetupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check setup status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/setup/status');
      const data: SetupStatus = await response.json();

      setStatus(data);

      // If fully initialized, redirect to home
      if (data.isInitialized) {
        setTimeout(() => router.push('/'), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check setup status');
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setInitializing(true);
      setError(null);

      const response = await fetch('/api/setup/init', { method: 'POST' });
      const data = await response.json();

      if (!data.success) {
        setError(data.error || 'Failed to initialize database');
        return;
      }

      setStatus(data.status);

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/register');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize database');
    } finally {
      setInitializing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Spinner className="h-8 w-8" />
              <p className="text-center text-muted-foreground">Checking system status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>System Error</CardTitle>
            <CardDescription>Unable to load setup information</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Unknown error occurred'}</AlertDescription>
            </Alert>
            <Button onClick={checkStatus} className="w-full mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Database not configured
  if (!status.dbConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Database Configuration Required</CardTitle>
            <CardDescription>Set up your database connection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>DATABASE_URL environment variable is not configured</AlertDescription>
            </Alert>
            <div className="space-y-3 text-sm">
              <p className="font-semibold">To get started:</p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Set up your PostgreSQL database</li>
                <li>Get your connection string (DATABASE_URL)</li>
                <li>Add it to your environment variables</li>
                <li>Restart your application</li>
              </ol>
            </div>
            <div className="bg-muted p-3 rounded text-xs font-mono">
              postgresql://user:password@host:5432/database
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Connection error
  if (!status.connectionValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Database Connection Error</CardTitle>
            <CardDescription>Cannot connect to database</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Unable to connect to the database at the configured URL. Please verify:</AlertDescription>
            </Alert>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Database server is running</li>
              <li>Connection string is correct</li>
              <li>Network connectivity is available</li>
              <li>Firewall rules allow connection</li>
            </ul>
            <Button onClick={checkStatus} className="w-full">
              Retry Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // All initialized
  if (status.isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>System Ready</CardTitle>
            <CardDescription>Your database is fully initialized</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Redirecting to application...</p>
            <Spinner className="h-4 w-4 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Need to initialize database
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-6 w-6" />
            Initialize Your Database
          </CardTitle>
          <CardDescription>Complete these steps to set up the shift scheduling system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Create Tables */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {status.tablesCreated ? (
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold">1</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">Create Database Schema</h3>
                <p className="text-sm text-muted-foreground">
                  Initialize tables for users, employees, shifts, and schedules
                </p>
              </div>
            </div>
          </div>

          {/* Step 2: Create Admin */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              {status.adminExists ? (
                <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-muted-foreground">2</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">Create Admin Account</h3>
                <p className="text-sm text-muted-foreground">
                  Set up your administrator account for system management
                </p>
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Features Preview */}
          {!status.tablesCreated && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">What will be set up:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Secure user authentication
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Employee and team management
                </li>
                <li className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-primary" />
                  Shift and schedule data storage
                </li>
              </ul>
            </div>
          )}

          {/* Action Button */}
          {!status.tablesCreated ? (
            <Button
              onClick={initializeDatabase}
              disabled={initializing}
              className="w-full"
              size="lg"
            >
              {initializing ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Initializing...
                </>
              ) : (
                'Initialize Database'
              )}
            </Button>
          ) : !status.adminExists ? (
            <Button asChild className="w-full" size="lg">
              <a href="/register">Create Admin Account</a>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
