'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle, AlertCircle, LogOut, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Employee {
  id: string;
  full_name: string;
  department?: string;
  position?: string;
}

interface AttendanceStatsProps {
  presentCount: number;
  alfaCount: number;
  leaveCount: number;
  date: string;
}

export function AttendanceStats({ presentCount, alfaCount, leaveCount, date }: AttendanceStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'present' | 'alfa' | 'leave'>('present');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEmployees = async (category: 'present' | 'alfa' | 'leave') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/attendance/list?category=${category}&date=${date}`);
      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = async (category: 'present' | 'alfa' | 'leave') => {
    setActiveTab(category);
    setIsOpen(true);
    await fetchEmployees(category);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className="cursor-pointer group hover:shadow-xl hover:border-green-500/50 transition-all duration-300 border border-border/50 overflow-hidden bg-gradient-to-br from-emerald-50/50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/20"
          onClick={() => handleCardClick('present')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Karyawan Hadir</CardTitle>
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg group-hover:scale-110 transition-transform">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Sudah check-in hari ini</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer group hover:shadow-xl hover:border-red-500/50 transition-all duration-300 border border-border/50 overflow-hidden bg-gradient-to-br from-red-50/50 to-rose-50/50 dark:from-red-950/20 dark:to-rose-950/20"
          onClick={() => handleCardClick('alfa')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Karyawan Alfa</CardTitle>
            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-lg group-hover:scale-110 transition-transform">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{alfaCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Tidak hadir tanpa izin</p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer group hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 border border-border/50 overflow-hidden bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20"
          onClick={() => handleCardClick('leave')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Karyawan Izin</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg group-hover:scale-110 transition-transform">
              <LogOut className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{leaveCount}</div>
            <p className="text-xs text-muted-foreground mt-2">Cuti/izin resmi</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'present' && '📋 Daftar Karyawan Hadir'}
              {activeTab === 'alfa' && '⚠️ Daftar Karyawan Alfa'}
              {activeTab === 'leave' && '🎫 Daftar Karyawan Izin'}
            </DialogTitle>
            <DialogDescription>
              Data per tanggal {new Date(date).toLocaleDateString('id-ID')}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(value) => {
            setActiveTab(value as 'present' | 'alfa' | 'leave');
            fetchEmployees(value as 'present' | 'alfa' | 'leave');
          }}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="present" className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 dark:data-[state=active]:bg-emerald-900 dark:data-[state=active]:text-emerald-300">Hadir ({presentCount})</TabsTrigger>
              <TabsTrigger value="alfa" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 dark:data-[state=active]:bg-red-900 dark:data-[state=active]:text-red-300">Alfa ({alfaCount})</TabsTrigger>
              <TabsTrigger value="leave" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-300">Izin ({leaveCount})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : employees.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {activeTab === 'present' && 'Belum ada karyawan yang hadir'}
                  {activeTab === 'alfa' && 'Tidak ada karyawan alfa'}
                  {activeTab === 'leave' && 'Tidak ada karyawan dengan izin'}
                </div>
              ) : (
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <div key={emp.id} className="border rounded-lg p-4 hover:bg-muted hover:border-primary/30 transition-all duration-200 group">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{emp.full_name}</div>
                      {emp.department || emp.position ? (
                        <div className="text-sm text-muted-foreground mt-1">
                          {emp.department && <span>{emp.department}</span>}
                          {emp.department && emp.position && <span> • </span>}
                          {emp.position && <span>{emp.position}</span>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
