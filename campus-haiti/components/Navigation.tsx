"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { auth } from "@/lib/firebase/client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Navigation() {
  const t = useTranslations("nav");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      await auth.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xl font-bold">
            Campus Haiti
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="text-sm hover:underline">
              {t("home")}
            </Link>
            <Link href="/apply" className="text-sm hover:underline">
              {t("apply")}
            </Link>
            <Link href="/partners" className="text-sm hover:underline">
              {t("partners")}
            </Link>
            <Link href="/help" className="text-sm hover:underline">
              {t("help")}
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <LocaleSwitcher />
          
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      {t("dashboard")}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    {t("signOut")}
                  </Button>
                </>
              ) : (
                <Link href="/auth/signin">
                  <Button size="sm">{t("signIn")}</Button>
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
