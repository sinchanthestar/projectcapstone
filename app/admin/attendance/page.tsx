'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AttendanceLog {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  attendance_date: string;
  check_in_at: string | null;
  check_out_at: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes: string | null;
}

export default function AttendancePage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AttendanceLog | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/admin/attendance?status=PENDING');
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        toast.error('Failed to load attendance logs');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error loading logs');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (log: AttendanceLog) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/attendance/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId: log.id }),
      });

      if (response.ok) {
        toast.success(`Approved attendance for ${log.full_name}`);
        fetchLogs();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || 'Failed to approve');
      }
    } catch (error) {
      console.error('Approve error:', error);
      toast.error('Error approving attendance');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (log: AttendanceLog) => {
    setSelectedLog(log);
    setRejectNotes('');
    setRejectDialog(true);
  };

  const handleReject = async () => {
    if (!selectedLog) return;

    setActionLoading(true);
    try {
      const response = await fetch('/api/admin/attendance/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendanceId: selectedLog.id, notes: rejectNotes }),
      });

      if (response.ok) {
        toast.success(`Rejected attendance for ${selectedLog.full_name}`);
        setRejectDialog(false);
        fetchLogs();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || 'Failed to reject');
      }
    } catch (error) {
      console.error('Reject error:', error);
      toast.error('Error rejecting attendance');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center p-8">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Attendance Approval</h1>

        <Card>
          <CardHeader>
            <CardTitle>Pending Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending attendance records
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Check In</TableHead>
                      <TableHead>Check Out</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.full_name}</TableCell>
                        <TableCell>
                          {format(new Date(log.attendance_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {log.check_in_at
                            ? format(new Date(log.check_in_at), 'HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {log.check_out_at
                            ? format(new Date(log.check_out_at), 'HH:mm')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.status}</Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(log)}
                            disabled={actionLoading}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectClick(log)}
                            disabled={actionLoading}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Attendance</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedLog && (
              <div className="text-sm text-muted-foreground">
                <p>Employee: <strong>{selectedLog.full_name}</strong></p>
                <p>Date: <strong>{format(new Date(selectedLog.attendance_date), 'MMM dd, yyyy')}</strong></p>
              </div>
            )}
            <div>
              <Label htmlFor="reject-notes">Rejection Notes (Optional)</Label>
              <Textarea
                id="reject-notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Reason for rejection..."
                className="mt-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setRejectDialog(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={actionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                {actionLoading ? 'Rejecting...' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
