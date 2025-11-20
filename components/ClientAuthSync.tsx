"use client";

import { useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function ClientAuthSync() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";
  const syncedRef = useRef(false);

  useEffect(() => {
    // Only run once
    if (syncedRef.current) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !syncedRef.current) {
        // User is signed in on client, ensure session cookie exists
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          
          if (response.ok) {
            syncedRef.current = true;
            // Refresh the page once to update server-side state
            router.refresh();
          }
        } catch (error) {
          console.error("Failed to sync session:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [router, locale]);

  return null;
}
