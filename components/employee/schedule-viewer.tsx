'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Assignment {
  id: string;
  shift_id: string;
  scheduled_date: string;
  is_confirmed: boolean;
  shift_name: string;
  start_time: string;
  end_time: string;
  color: string;
}

export function ScheduleViewer() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const sessionResponse = await fetch('/api/auth/session');
        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setUser(sessionData.user);

          // Get employee assignments
          const assignmentsResponse = await fetch(
            `/api/assignments?employeeId=${sessionData.user.id}`
          );
          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            setAssignments(assignmentsData.assignments || []);
          }
        }
      } catch (error) {
        toast.error('Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex gap-2 mb-4">
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-muted-foreground">Memuat jadwal Anda...</p>
        </div>
      </div>
    );
  }

  const upcomingAssignments = assignments
    .filter(
      (a) =>
        new Date(a.scheduled_date) >= startOfDay(new Date())
    )
    .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
    .slice(0, 10);

  const pastAssignments = assignments
    .filter(
      (a) =>
        new Date(a.scheduled_date) < startOfDay(new Date())
    )
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Calendar className="h-7 w-7 text-primary" />
          </div>
          Jadwal Kerja Anda
        </h2>
        <p className="text-muted-foreground text-lg">
          Lihat jadwal shift yang telah ditugaskan untuk Anda
        </p>
      </div>

      {/* Upcoming Shifts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-1 w-8 bg-gradient-to-r from-primary to-accent rounded-full"></div>
          <h3 className="text-2xl font-semibold">Jadwal Mendatang</h3>
        </div>

        {upcomingAssignments.length === 0 ? (
          <Alert className="border-2 border-border/50 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300 font-medium">
              Belum ada shift yang ditugaskan. Silakan periksa kembali untuk tugas baru.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingAssignments.map((assignment) => {
              const shiftDate = new Date(assignment.scheduled_date);
              const isToday =
                format(shiftDate, 'yyyy-MM-dd') ===
                format(new Date(), 'yyyy-MM-dd');
              const isTomorrow =
                format(shiftDate, 'yyyy-MM-dd') ===
                format(addDays(new Date(), 1), 'yyyy-MM-dd');

              return (
                <Card key={assignment.id} className="overflow-hidden group hover:shadow-lg transition-all duration-300 border border-border/50">
                  <div
                    className="h-1 group-hover:h-2 transition-all"
                    style={{ backgroundColor: assignment.color }}
                  />
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {assignment.shift_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2 font-medium">
                          {isToday && '📅 Hari Ini'}
                          {isTomorrow && '📅 Besok'}
                          {!isToday && !isTomorrow &&
                            format(shiftDate, 'EEEE, d MMM')}
                        </p>
                      </div>
                      <Badge 
                        variant={assignment.is_confirmed ? 'default' : 'outline'}
                        className={assignment.is_confirmed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'}
                      >
                        {assignment.is_confirmed ? '✅ Confirmed' : '⏳ Pending'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3 text-sm font-semibold bg-muted/50 p-3 rounded-lg">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>
                        {assignment.start_time} - {assignment.end_time}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Past Shifts */}
      {pastAssignments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-8 bg-gradient-to-r from-muted-foreground/50 to-muted-foreground/30 rounded-full"></div>
            <h3 className="text-2xl font-semibold text-muted-foreground">Jadwal Sebelumnya</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastAssignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden opacity-60 hover:opacity-90 transition-opacity border border-border/30">
                <div
                  className="h-1"
                  style={{ backgroundColor: assignment.color }}
                />
                <CardHeader className="pb-2">
                  <div>
                    <CardTitle className="text-lg">
                      {assignment.shift_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2 font-medium">
                      {format(
                        new Date(assignment.scheduled_date),
                        'EEEE, d MMM'
                      )}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm font-semibold bg-muted/50 p-3 rounded-lg">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <span>
                      {assignment.start_time} - {assignment.end_time}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
