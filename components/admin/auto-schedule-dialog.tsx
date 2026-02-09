'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AutoScheduleDialogProps {
  onSuccess?: () => void;
  onDateRangeScheduled?: (startDate: string) => void;
}

export function AutoScheduleDialog({ onSuccess, onDateRangeScheduled }: AutoScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [algorithm, setAlgorithm] = useState('backtrack');
  const [clearExisting, setClearExisting] = useState(false);
  const [startDate, setStartDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
  );
  const [result, setResult] = useState<any>(null);

  const handleSchedule = async () => {
    // Validate
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Clear existing schedules if selected
      if (clearExisting) {
        const clearResponse = await fetch('/api/assignments/clear-range', {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate,
            endDate,
          }),
        });

        if (!clearResponse.ok) {
          const error = await clearResponse.json();
          toast.error(error.error || 'Failed to clear existing schedules');
          setLoading(false);
          return;
        }

        const clearData = await clearResponse.json();
        toast.success(`Jadwal lama dihapus: ${clearData.deleted} jadwal dihapus`);
      }

      // Step 2: Generate new schedule
      const response = await fetch('/api/assignments/auto-schedule', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          algorithm,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.summary);
        toast.success(
          `Jadwal otomatis dibuat! ${data.summary.inserted} assignment berhasil untuk ${data.summary.datesProcessed} hari`
        );
        
        // Delay slightly to ensure UI updates before navigation
        setTimeout(() => {
          // Close dialog
          setOpen(false);
          // Reset result for next use
          setResult(null);
          // Reset form
          setStartDate(format(new Date(), 'yyyy-MM-dd'));
          setEndDate(format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'));
          setClearExisting(false);
          // Trigger callback with first scheduled date from API
          onDateRangeScheduled?.(data.summary.firstScheduledDate);
          onSuccess?.();
        }, 500);
      } else if (response.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate schedule');
      }
    } catch (error) {
      toast.error('Error generating schedule');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="gap-2">
          <Zap className="h-4 w-4" />
          Auto Schedule
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Buat Jadwal Otomatis</DialogTitle>
          <DialogDescription>
            Gunakan algoritma backtracking untuk membuat jadwal yang optimal dan fair
          </DialogDescription>
        </DialogHeader>

        {result ? (
          // Show result
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Jadwal Berhasil Dibuat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Request</p>
                    <p className="text-2xl font-bold">{result.requested}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Berhasil Dibuat</p>
                    <p className="text-2xl font-bold text-green-600">
                      {result.inserted}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Konflik</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {result.conflicts}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hari Dijadwalkan</p>
                    <p className="text-2xl font-bold">{result.datesProcessed}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Algoritma</p>
                  <p className="font-semibold capitalize">{result.algorithm}</p>

                  <p className="text-sm text-gray-600 mt-4">Periode</p>
                  <p className="text-sm">
                    {result.dateRange.startDate} s/d {result.dateRange.endDate}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setOpen(false);
                }}
              >
                Tutup
              </Button>
            </div>
          </div>
        ) : (
          // Show form
          <div className="space-y-6">
            <Alert className="bg-blue-50 border-blue-200">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Algoritma akan membuat jadwal otomatis berdasarkan ketersediaan karyawan
                dan distribusi yang fair. Dengan opsi "Clear Existing Schedules", jadwal lama akan dihapus terlebih dahulu.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="start-date">Tanggal Mulai</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="end-date">Tanggal Akhir</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="algorithm">Algoritma</Label>
                <Select value={algorithm} onValueChange={setAlgorithm}>
                  <SelectTrigger id="algorithm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="backtrack">
                      Backtracking (Optimal)
                    </SelectItem>
                    <SelectItem value="greedy">Greedy (Cepat)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 mt-2">
                  Backtracking: Lebih optimal tapi lebih lambat. Greedy: Lebih cepat
                  tapi kurang optimal.
                </p>
              </div>

              <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="clear-existing"
                    checked={clearExisting}
                    onCheckedChange={(checked) => setClearExisting(checked as boolean)}
                  />
                  <Label htmlFor="clear-existing" className="font-medium cursor-pointer text-sm">
                    🗑️ Hapus jadwal lama sebelum generate yang baru
                  </Label>
                </div>
                <p className="text-xs text-yellow-700 ml-6">
                  Jika diaktifkan, akan menghapus semua jadwal dalam date range untuk menghindari tabrakan.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Batal
              </Button>
              <Button onClick={handleSchedule} disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? 'Processing...' : 'Buat Jadwal'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
