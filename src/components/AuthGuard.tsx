// Route protection guard
// Location: src/components/AuthGuard.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '../lib/auth';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const user = auth.getSessionUser();
      
      // Public portal pages are accessible by anyone without login
      const isPublicPortal = pathname?.startsWith('/portal');
      const isLoginPage = pathname === '/login';

      if (isPublicPortal) {
        setIsAuthenticated(true);
        return;
      }

      if (!user) {
        if (!isLoginPage) {
          setIsAuthenticated(false);
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
      } else {
        if (isLoginPage) {
          router.push('/');
        }
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  // Prevent flash of protected content during check
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100vh] bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
        <p className="mt-4 text-slate-500 text-sm font-medium">Verifying credentials session...</p>
      </div>
    );
  }

  return <>{children}</>;
}
