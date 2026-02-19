'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { handleAtom } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Activity, LayoutGrid, ListTodo, User, LogOut, Brain, Code2, Swords } from 'lucide-react';

import { cn } from '@/lib/utils';

export function Navbar() {
  const [handle, setHandle] = useAtom(handleAtom);
  const pathname = usePathname();
  const router = useRouter();

  const clearHandle = () => {
    setHandle(null);
    router.push('/');
  };

  const navLinks = [
    { href: '/',         label: 'Codeforces', icon: LayoutGrid },
    { href: '/leetcode', label: 'LeetCode',   icon: Code2      },
    { href: '/compare',  label: 'Compare',    icon: Swords     },
    { href: '/practice', label: 'Practice',   icon: ListTodo   },
  ];

  return (
    <header className="border-b border-border/50 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Activity className="h-4 w-4" />
          </div>
          <span className="hidden sm:block">CP Tracker</span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'gap-2 text-muted-foreground hover:text-foreground',
                  pathname === href && 'bg-accent text-foreground font-medium'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        {handle && (
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{handle}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHandle}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Switch user"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
