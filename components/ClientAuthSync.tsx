"use client";

import { useEffect, useRef } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function ClientAuthSync() {
  const syncedRef = useRef(false);
  const hasSessionRef = useRef(false);

  useEffect(() => {
    // Check if session cookie already exists
    const hasSession = document.cookie.includes('session=');
    if (hasSession) {
      hasSessionRef.current = true;
      syncedRef.current = true;
      return;
    }

    // Only run once
    if (syncedRef.current) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !syncedRef.current && !hasSessionRef.current) {
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
            hasSessionRef.current = true;
            // Only refresh if we just created a new session
            window.location.reload();
          }
        } catch (error) {
          console.error("Failed to sync session:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
