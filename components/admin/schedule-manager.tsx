'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, CheckCircle2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ExportSchedule } from './export-schedule';
import { AutoScheduleDialog } from './auto-schedule-dialog';

interface Employee {
  id: string;
  full_name: string;
}

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  color: string;
}

interface Assignment {
  id: string;
  employee_id: string;
  shift_id: string;
  scheduled_date: string;
  is_confirmed: boolean;
  full_name: string;
  shift_name: string;
  start_time: string;
  end_time: string;
  color: string;
}

export function ScheduleManager() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openClearDialog, setOpenClearDialog] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearDateRange, setClearDateRange] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  });
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [formData, setFormData] = useState({
    employeeId: '',
    shiftId: '',
    scheduledDate: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    Promise.all([fetchEmployees(), fetchShifts(), fetchAssignments()]).then(
      () => setLoading(false)
    );
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees);
      }
    } catch (error) {
      toast.error('Failed to load employees');
    }
  };

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/shifts');
      if (response.ok) {
        const data = await response.json();
        setShifts(data.shifts.filter((s: Shift) => s.is_active));
      }
    } catch (error) {
      toast.error('Failed to load shifts');
    }
  };

  const fetchAssignments = async (date?: string) => {
    const targetDate = date || selectedDate;
    try {
      const response = await fetch(
        `/api/assignments?date=${targetDate}`
      );
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.assignments);
      }
    } catch (error) {
      toast.error('Failed to load assignments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.employeeId || !formData.shiftId) {
      toast.error('Please select employee and shift');
      return;
    }

    try {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: formData.employeeId,
          shiftId: formData.shiftId,
          scheduledDate: formData.scheduledDate,
        }),
      });

      if (response.ok) {
        toast.success('Assignment created');
        setOpenDialog(false);
        setFormData({
          employeeId: '',
          shiftId: '',
          scheduledDate: format(new Date(), 'yyyy-MM-dd'),
        });
        fetchAssignments();
      } else if (response.status === 409) {
        toast.error('Employee already has a shift on this date');
      } else {
        toast.error('Failed to create assignment');
      }
    } catch (error) {
      toast.error('Error creating assignment');
    }
  };

  const handleConfirm = async (id: string, isConfirmed: boolean) => {
    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isConfirmed: !isConfirmed }),
      });

      if (response.ok) {
        toast.success('Assignment updated');
        fetchAssignments();
      } else {
        toast.error('Failed to update assignment');
      }
    } catch (error) {
      toast.error('Error updating assignment');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this assignment?')) return;

    try {
      const response = await fetch(`/api/assignments/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Assignment deleted');
        fetchAssignments();
      } else {
        toast.error('Failed to delete assignment');
      }
    } catch (error) {
      toast.error('Error deleting assignment');
    }
  };

  const handleClearRange = async () => {
    if (!confirm(`Hapus semua jadwal dari ${clearDateRange.startDate} sampai ${clearDateRange.endDate}? Tindakan ini tidak dapat dibatalkan!`)) {
      return;
    }

    if (new Date(clearDateRange.startDate) > new Date(clearDateRange.endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setClearLoading(true);
    try {
      const response = await fetch('/api/assignments/clear-range', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate: clearDateRange.startDate,
          endDate: clearDateRange.endDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`${data.deleted} jadwal telah dihapus`);
        setOpenClearDialog(false);
        fetchAssignments();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to clear schedule range');
      }
    } catch (error) {
      toast.error('Error clearing schedule range');
    } finally {
      setClearLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-muted-foreground">Loading schedule data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Management</h1>
        <div className="flex gap-2 flex-wrap">
          <AutoScheduleDialog 
            onSuccess={() => {
              // Refresh assignments for current date
              fetchAssignments();
            }}
            onDateRangeScheduled={(date) => {
              // Update date and fetch assignments for that date
              setSelectedDate(date);
              fetchAssignments(date);
            }}
          />
          
          <Dialog open={openClearDialog} onOpenChange={setOpenClearDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear Range
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hapus Jadwal dalam Date Range</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="clear-start">Tanggal Mulai</Label>
                  <Input
                    id="clear-start"
                    type="date"
                    value={clearDateRange.startDate}
                    onChange={(e) =>
                      setClearDateRange({ ...clearDateRange, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="clear-end">Tanggal Akhir</Label>
                  <Input
                    id="clear-end"
                    type="date"
                    value={clearDateRange.endDate}
                    onChange={(e) =>
                      setClearDateRange({ ...clearDateRange, endDate: e.target.value })
                    }
                  />
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    ⚠️ Semua jadwal dalam date range ini akan dihapus. Tindakan ini tidak dapat dibatalkan!
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setOpenClearDialog(false)}
                    disabled={clearLoading}
                  >
                    Batal
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleClearRange}
                    disabled={clearLoading}
                    className="gap-2"
                  >
                    {clearLoading && <Trash2 className="h-4 w-4 animate-spin" />}
                    {clearLoading ? 'Menghapus...' : 'Hapus Jadwal'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <ExportSchedule />
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Assign Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Shift to Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="employee">Employee</Label>
                  <Select
                    value={formData.employeeId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, employeeId: value })
                    }
                  >
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="shift">Shift</Label>
                  <Select
                    value={formData.shiftId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, shiftId: value })
                    }
                  >
                    <SelectTrigger id="shift">
                      <SelectValue placeholder="Select shift" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name} ({shift.start_time} - {shift.end_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledDate: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Assign Shift
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Assignments for {selectedDate}</CardTitle>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No assignments for this date
                    </TableCell>
                  </TableRow>
                ) : (
                  assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        {assignment.full_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: assignment.color }}
                          />
                          {assignment.shift_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        {assignment.start_time} - {assignment.end_time}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={assignment.is_confirmed}
                            onCheckedChange={() =>
                              handleConfirm(assignment.id, assignment.is_confirmed)
                            }
                          />
                          <span className="text-sm">
                            {assignment.is_confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(assignment.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
