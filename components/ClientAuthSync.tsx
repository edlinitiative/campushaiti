"use client";

import { useEffect, useRef } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function ClientAuthSync() {
  const syncedRef = useRef(false);

  useEffect(() => {
    // Only run once per component lifetime
    if (syncedRef.current) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !syncedRef.current) {
        syncedRef.current = true;
        
        // Silently ensure session cookie exists
        // Don't reload - server-side rendering already handles auth state
        try {
          const idToken = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        } catch (error) {
          console.error("[ClientAuthSync] Failed to sync session:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
