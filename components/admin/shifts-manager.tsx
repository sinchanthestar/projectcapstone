'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Shift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
  color: string;
  is_active: boolean;
}

export function ShiftsManager() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '',
    endTime: '',
    description: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const response = await fetch('/api/shifts');
      if (response.ok) {
        const data = await response.json();
        setShifts(data.shifts);
      }
    } catch (error) {
      toast.error('Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (shift?: Shift) => {
    if (shift) {
      setEditingShift(shift);
      setFormData({
        name: shift.name,
        startTime: shift.start_time,
        endTime: shift.end_time,
        description: shift.description || '',
        color: shift.color,
      });
    } else {
      setEditingShift(null);
      setFormData({
        name: '',
        startTime: '',
        endTime: '',
        description: '',
        color: '#3b82f6',
      });
    }
    setOpenDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingShift ? `/api/shifts/${editingShift.id}` : '/api/shifts';
      const method = editingShift ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          startTime: formData.startTime,
          endTime: formData.endTime,
          description: formData.description,
          color: formData.color,
        }),
      });

      if (response.ok) {
        toast.success(editingShift ? 'Shift updated' : 'Shift created');
        setOpenDialog(false);
        fetchShifts();
      } else {
        toast.error('Failed to save shift');
      }
    } catch (error) {
      toast.error('Error saving shift');
    }
  };

  const handleDelete = async (id: string, shiftName: string) => {
    if (!confirm(`Delete shift "${shiftName}"? This cannot be undone if it has no active assignments.`)) return;

    try {
      const response = await fetch(`/api/shifts/${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('Shift deleted successfully');
        fetchShifts();
      } else {
        const error = await response.json();
        if (response.status === 400) {
          // Conflict - shift has active assignments
          toast.error(error.error || 'Cannot delete shift with active assignments');
        } else {
          toast.error(error.error || 'Failed to delete shift');
        }
      }
    } catch (error) {
      toast.error('Error deleting shift');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Shifts</h1>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              New Shift
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingShift ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Shift Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Morning Shift"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {editingShift ? 'Update Shift' : 'Create Shift'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: shift.color }}
                        />
                        {shift.name}
                      </div>
                    </TableCell>
                    <TableCell>{shift.start_time}</TableCell>
                    <TableCell>{shift.end_time}</TableCell>
                    <TableCell className="max-w-md text-sm text-muted-foreground">
                      {shift.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(shift)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(shift.id, shift.name)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
