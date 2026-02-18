'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformDashboard } from '@/components/dashboard/PlatformDashboard';
import { PracticeSheets } from '@/components/dashboard/PracticeSheets';
import { Activity, Code, Trophy, User, ArrowRight, LayoutGrid, ListTodo } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';

export default function Home() {
  const [handle, setHandle] = useState<string | null>(null);
  const [inputHandle, setInputHandle] = useState('');
  const [loading, setLoading] = useState(false);

  // Check local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cp-tracker-handle');
    if (saved) {
      setHandle(saved);
      setInputHandle(saved);
    }
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
      localStorage.setItem('cp-tracker-handle', inputHandle.trim());
      setLoading(false);
    }, 500); // Small artificial delay for effect
  };

  const clearHandle = () => {
    setHandle(null);
    localStorage.removeItem('cp-tracker-handle');
    setInputHandle('');
  };

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
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <Activity className="h-5 w-5" />
            </div>
            <span>CP Tracker</span>
          </div>
          
          <div className="flex items-center gap-4">
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
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <TabsList className="bg-muted/50 p-1 h-auto">
                <TabsTrigger value="dashboard" className="px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <LayoutGrid className="w-4 h-4" /> Dashboard
                </TabsTrigger>
                <TabsTrigger value="practice" className="px-4 py-2 gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <ListTodo className="w-4 h-4" /> Practice Sheets
                </TabsTrigger>
             </TabsList>
          </div>

          <TabsContent value="dashboard" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          </TabsContent>

          <TabsContent value="practice" className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <PracticeSheets handle={handle} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
