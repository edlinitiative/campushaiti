"use client";

import { useEffect, useRef } from "react";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function ClientAuthSync() {
  const syncedRef = useRef(false);

  useEffect(() => {
    // Check if session cookie already exists
    const hasSession = document.cookie.includes('session=');
    
    console.log('[ClientAuthSync] Mount - hasSession:', hasSession, 'synced:', syncedRef.current);
    
    if (hasSession) {
      console.log('[ClientAuthSync] Session exists, skipping sync');
      syncedRef.current = true;
      return;
    }

    // Only run once
    if (syncedRef.current) {
      console.log('[ClientAuthSync] Already synced, skipping');
      return;
    }

    console.log('[ClientAuthSync] Setting up auth listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[ClientAuthSync] Auth state changed - user:', !!user, 'synced:', syncedRef.current);
      
      if (user && !syncedRef.current) {
        console.log('[ClientAuthSync] Creating session cookie');
        // User is signed in on client, ensure session cookie exists
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          
          if (response.ok) {
            console.log('[ClientAuthSync] Session created successfully, reloading...');
            syncedRef.current = true;
            // Only refresh if we just created a new session
            window.location.reload();
          } else {
            console.error('[ClientAuthSync] Session creation failed:', response.status);
          }
        } catch (error) {
          console.error("[ClientAuthSync] Failed to sync session:", error);
        }
      }
    });

    return () => {
      console.log('[ClientAuthSync] Cleanup');
      unsubscribe();
    };
  }, []);

  return null;
}
