"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export function ClientAuthSync() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in on client, ensure session cookie exists
        try {
          const idToken = await user.getIdToken();
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
          // Refresh the page to update server-side state
          router.refresh();
        } catch (error) {
          console.error("Failed to sync session:", error);
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return null;
}
