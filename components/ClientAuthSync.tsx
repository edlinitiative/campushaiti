"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function ClientAuthSync() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string || "en";
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    // Only run once
    if (synced) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !synced) {
        // User is signed in on client, ensure session cookie exists
        try {
          const idToken = await user.getIdToken();
          const response = await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          
          if (response.ok) {
            setSynced(true);
            // Refresh the page to update server-side state
            router.refresh();
          }
        } catch (error) {
          console.error("Failed to sync session:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [router, locale, synced]);

  return null;
}
