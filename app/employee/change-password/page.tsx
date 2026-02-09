'use client';

import { useState } from 'react';
import { EmployeeLayout } from '@/components/employee/employee-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      toast.error('Konfirmasi password baru tidak sama');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal mengganti password');
        return;
      }

      toast.success('Password berhasil diganti ✅');
      setForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      toast.error('Terjadi error saat mengganti password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <EmployeeLayout>
      <div className="max-w-md mx-auto w-full p-4">
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Ganti password akun karyawan kamu</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="currentPassword">Password Lama</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  value={form.confirmNewPassword}
                  onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Update Password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
