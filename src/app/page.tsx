'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformDashboard } from '@/components/dashboard/PlatformDashboard';
import { Activity, Code, Trophy, User, ArrowRight, LayoutGrid, ListTodo } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { handleAtom } from '@/lib/store';
import Link from 'next/link';

export default function Home() {
  const [handle, setHandle] = useAtom(handleAtom);
  const [inputHandle, setInputHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const submitHandle = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputHandle.trim()) return;
    
    setLoading(true);
    // Include a specialized check or just set it?
    // User wants "fast", checking validity could be good but might delay. 
    // Let's set it and let the dashboard handle errors (which it already does).
    setTimeout(() => {
      setHandle(inputHandle.trim());
      setLoading(false);
    }, 500); // Small artificial delay for effect
  };

  const clearHandle = () => {
    setHandle(null);
    setInputHandle('');
  };

  if (!mounted) return null; // Avoid hydration mismatch with atomWithStorage

  if (!handle) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="w-full max-w-md"
        >
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-xl">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome to CP Tracker</CardTitle>
              <CardDescription>
                Enter your Codeforces handle to begin tracking your progress and training.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitHandle} className="space-y-4">
                <Input 
                  placeholder="e.g. tourist" 
                  value={inputHandle}
                  onChange={(e) => setInputHandle(e.target.value)}
                  className="h-12 text-lg bg-background/50"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-medium" 
                  disabled={loading || !inputHandle}
                >
                  {loading ? 'Connecting...' : 'Get Started'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

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
                 <Button variant="ghost" className="gap-2">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <Tabs defaultValue="Codeforces">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-bold tracking-tight">Platform Stats</h2>
                   <TabsList className="bg-muted">
                    <TabsTrigger value="Codeforces" className="flex items-center gap-2">
                      <Code className="h-4 w-4" /> Codeforces
                    </TabsTrigger>
                    {/* Placeholder for other platforms */}
                    <TabsTrigger value="LeetCode" disabled className="flex items-center gap-2 opacity-50">
                      <Code className="h-4 w-4" /> LeetCode
                    </TabsTrigger>
                    <TabsTrigger value="AtCoder" disabled className="flex items-center gap-2 opacity-50">
                      <Activity className="h-4 w-4" /> AtCoder
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="Codeforces">
                   <PlatformDashboard platform="Codeforces" handle={handle} />
                </TabsContent>
             </Tabs>
          </div>
      </main>
    </div>
  );
}
