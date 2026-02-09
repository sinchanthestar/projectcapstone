'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users, Calendar, Bell, Lock, Download, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check authentication status
        const authResponse = await fetch('/api/auth/session');
        if (authResponse.ok) {
          const data = await authResponse.json();
          if (data.user.role === 'admin' || data.user.role === 'manager') {
            router.push('/admin');
          } else {
            router.push('/employee');
          }
          return;
        }

        // If not authenticated, check setup status
        const setupResponse = await fetch('/api/setup/status');
        if (setupResponse.ok) {
          const setupData = await setupResponse.json();
          if (!setupData.isInitialized && setupData.dbConfigured) {
            router.push('/setup');
          }
        }
      } catch (error) {
        // User not authenticated, show home page
      }
    };

    checkStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Shift Manager</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="hover:bg-primary/10">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center space-y-8">
          <div className="space-y-6 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
              ✨ Powerful Shift Scheduling
            </div>
            <h2 className="text-6xl md:text-7xl font-bold tracking-tight">
              Simplify Employee
              <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mt-2"> Shift Scheduling</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Manage your team's schedule efficiently with our comprehensive shift management system. From creating shifts to handling conflicts, everything you need in one powerful platform.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 px-8 gap-2 group">
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 hover:bg-primary/10">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need to manage shifts efficiently</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={Clock}
            title="Easy Shift Management"
            description="Create, edit, and manage shift types with flexible start and end times"
          />
          <FeatureCard
            icon={Users}
            title="Team Management"
            description="View employee profiles, departments, and availability status at a glance"
          />
          <FeatureCard
            icon={Calendar}
            title="Schedule Assignments"
            description="Assign shifts to employees with an intuitive calendar interface"
          />
          <FeatureCard
            icon={Lock}
            title="Conflict Detection"
            description="Automatically prevent duplicate shift assignments for the same employee"
          />
          <FeatureCard
            icon={Bell}
            title="Notifications"
            description="Keep employees informed of their upcoming shifts and schedule changes"
          />
          <FeatureCard
            icon={Download}
            title="Export Options"
            description="Export schedules to PDF or CSV for external use and archiving"
          />
        </div>
      </section>

      {/* Role-Based Access Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for Every Role</h2>
          <p className="text-xl text-muted-foreground">Tailored features for different user levels</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <RoleCard
            title="Admins"
            description="Full system control"
            features={[
              'Create and manage shifts',
              'Manage all employees',
              'Assign and modify schedules',
              'View and export reports'
            ]}
            icon={<Users className="h-8 w-8" />}
          />
          <RoleCard
            title="Managers"
            description="Team oversight"
            features={[
              'Create shifts',
              'Manage team schedule',
              'Assign shifts to team',
              'View team reports'
            ]}
            icon={<Clock className="h-8 w-8" />}
            highlight
          />
          <RoleCard
            title="Employees"
            description="Personal schedule"
            features={[
              'View your shifts',
              'Check upcoming schedule',
              'Receive notifications',
              'Track past shifts'
            ]}
            icon={<Calendar className="h-8 w-8" />}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 p-12 sm:p-16 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to streamline your scheduling?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join teams that are already managing shifts more efficiently
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white border-0 px-8">
              Create Your Account Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <div className="mb-4 flex justify-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Support</a>
          </div>
          <p className="text-muted-foreground">&copy; 2024 Shift Manager. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <CardHeader className="relative">
        <div className="flex items-start gap-4 mb-2">
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function RoleCard({
  title,
  description,
  features,
  icon,
  highlight,
}: {
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      highlight 
        ? 'border-2 border-primary shadow-xl scale-105' 
        : 'hover:shadow-lg hover:border-primary/50'
    }`}>
      {highlight && (
        <div className="absolute top-0 right-0 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-bl-lg">
          Popular
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-3 rounded-lg ${
            highlight 
              ? 'bg-primary/20 text-primary' 
              : 'bg-primary/10 text-primary'
          }`}>
            {icon}
          </div>
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className={`mt-1 h-2 w-2 rounded-full ${highlight ? 'bg-primary' : 'bg-accent'}`}></div>
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
