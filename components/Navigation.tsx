"use client";

import { Link } from "@/lib/navigation";
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
  const [mounted, setMounted] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Get ID token to access custom claims
        const idTokenResult = await user.getIdTokenResult();
        setUserRole(idTokenResult.claims.role as string || null);
      } else {
        setUserRole(null);
      }
      
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
            <Link href="/schools/register" className="text-sm hover:underline">
              {t("forSchools")}
            </Link>
            <Link href="/help" className="text-sm hover:underline">
              {t("help")}
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <LocaleSwitcher />
          
          {!mounted || loading ? (
            // Show placeholder during hydration to match SSR
            <div className="w-20 h-9" />
          ) : (
            <>
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">
                      {t("dashboard")}
                    </Button>
                  </Link>
                  
                  {/* Show School Portal link only for SCHOOL_ADMIN users */}
                  {userRole === "SCHOOL_ADMIN" && (
                    <Link href="/schools/dashboard">
                      <Button variant="ghost" size="sm">
                        {t("schoolPortal")}
                      </Button>
                    </Link>
                  )}
                  
                  {/* Show Admin link only for ADMIN users */}
                  {userRole === "ADMIN" && (
                    <Link href="/admin">
                      <Button variant="ghost" size="sm">
                        Admin
                      </Button>
                    </Link>
                  )}
                  
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    {t("signOut")}
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signup">
                    <Button variant="outline" size="sm">{t("signUp")}</Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button size="sm">{t("signIn")}</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
