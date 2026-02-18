'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlatformDashboard } from '@/components/dashboard/PlatformDashboard';
import { Activity, Code, Trophy, User } from 'lucide-react';

export default function Home() {
  const [handle, setHandle] = useState('tourist');
  const [tempHandle, setTempHandle] = useState('');
  const [open, setOpen] = useState(false);

  // Platform icons/colors mapping could go here
  
  const handleSave = () => {
    if (tempHandle) {
      setHandle(tempHandle);
      setOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Activity className="h-6 w-6 text-primary" />
            <span>CP Tracker</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setTempHandle(handle)}>
                  <User className="mr-2 h-4 w-4" />
                  {handle}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Enter your coding handle to fetch statistics.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="handle" className="text-right">
                      Handle
                    </Label>
                    <Input
                      id="handle"
                      value={tempHandle}
                      onChange={(e) => setTempHandle(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleSave}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="Codeforces" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Track your competitive programming progress across platforms.
              </p>
            </div>
            <TabsList className="bg-muted">
              <TabsTrigger value="Codeforces" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Code className="h-4 w-4" /> Codeforces
              </TabsTrigger>
              <TabsTrigger value="LeetCode" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Code className="h-4 w-4" /> LeetCode
              </TabsTrigger>
              <TabsTrigger value="CodeChef" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Trophy className="h-4 w-4" /> CodeChef
              </TabsTrigger>
              <TabsTrigger value="AtCoder" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Activity className="h-4 w-4" /> AtCoder
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="Codeforces" className="space-y-4">
            <PlatformDashboard platform="Codeforces" handle={handle} />
          </TabsContent>
          <TabsContent value="LeetCode" className="space-y-4">
            <PlatformDashboard platform="LeetCode" handle={handle} />
          </TabsContent>
          <TabsContent value="CodeChef" className="space-y-4">
            <PlatformDashboard platform="CodeChef" handle={handle} />
          </TabsContent>
           <TabsContent value="AtCoder" className="space-y-4">
            <PlatformDashboard platform="AtCoder" handle={handle} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
