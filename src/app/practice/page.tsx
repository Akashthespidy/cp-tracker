'use client';

import { PracticeSheets } from '@/components/dashboard/PracticeSheets';
import { useAtom } from 'jotai';
import { handleAtom } from '@/lib/store';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Activity, LayoutGrid, ListTodo, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PracticePage() {
  const [handle, setHandle] = useAtom(handleAtom);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if no handle found after mount
  useEffect(() => {
    if (mounted && !handle) {
      router.push('/');
    }
  }, [mounted, handle, router]);

  const clearHandle = () => {
    setHandle(null);
    router.push('/');
  };

  if (!mounted) return null;
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span>CP Tracker</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <nav className="flex items-center gap-1 mr-4">
              <Link href="/">
                <Button variant="ghost" className="gap-2">
                  <LayoutGrid className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <Link href="/practice">
                 <Button variant="ghost" className="gap-2 bg-accent text-accent-foreground">
                  <ListTodo className="w-4 h-4" /> Practice Sheets
                </Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{handle}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearHandle} className="text-muted-foreground hover:text-destructive">
              Switch User
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <PracticeSheets />
      </main>
    </div>
  );
}
