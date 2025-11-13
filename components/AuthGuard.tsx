"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged, User } from "firebase/auth";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-pulse">
        <div className="h-9 bg-gray-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-96"></div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthGuard({ 
  children,
  fallback = <DashboardLoading />
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we have a cached auth state
    const cachedUser = auth.currentUser;
    if (cachedUser) {
      setUser(cachedUser);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth/signin");
        return;
      }
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return fallback;
  }

  return <>{children}</>;
}
