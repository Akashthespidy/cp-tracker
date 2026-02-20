'use client';

import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { handleAtom } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { PracticeSheets } from '@/components/dashboard/PracticeSheets';

export default function PracticePage() {
  const [handle] = useAtom(handleAtom);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && !handle) router.push('/');
  }, [mounted, handle, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Practice Sheets</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            A2OJ-style curated ladders — solve 100 problems per level to level up
          </p>
        </div>
        <PracticeSheets />
      </main>
    </div>
  );
}
