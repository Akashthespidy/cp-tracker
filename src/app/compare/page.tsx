'use client';

import { Navbar } from '@/components/Navbar';
import { CFCompare } from '@/components/dashboard/cf/CFCompare';

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <CFCompare />
      </main>
    </div>
  );
}
