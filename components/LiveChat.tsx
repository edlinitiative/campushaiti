"use client";

import { useEffect, useState } from "react";

export function LiveChat() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check if live chat is enabled
    const checkSettings = async () => {
      try {
        const response = await fetch("/api/admin/platform-settings");
        if (response.ok) {
          const data = await response.json();
          setEnabled(data.liveChatEnabled ?? true);
        } else {
          // Default to enabled if can't fetch settings
          setEnabled(true);
        }
      } catch (error) {
        console.error("Error checking live chat settings:", error);
        // Default to enabled on error
        setEnabled(true);
      }
    };

    checkSettings();
  }, []);

  useEffect(() => {
    // Only load if enabled and in browser
    if (!enabled || typeof window === "undefined") return;

    // Tawk.to Live Chat Widget
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

    // Demo mode - replace with your actual IDs
    const demoPropertyId = "662a1b2ca0c6737bd12b2a8c";
    const demoWidgetId = "1hvbhtbko";

    const actualPropertyId = propertyId || demoPropertyId;
    const actualWidgetId = widgetId || demoWidgetId;

    // Initialize Tawk.to
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const script = document.createElement("script");
    script.id = "tawk-script";
    script.async = true;
    script.src = `https://embed.tawk.to/${actualPropertyId}/${actualWidgetId}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    document.body.appendChild(script);

    // Cleanup on unmount
    return () => {
      const tawkScript = document.getElementById("tawk-script");
      if (tawkScript) {
        tawkScript.remove();
      }
      
      // Remove Tawk widget
      const tawkWidget = document.getElementById("tawkchat-container");
      if (tawkWidget) {
        tawkWidget.remove();
      }

      // Clean up global Tawk variables
      delete (window as any).Tawk_API;
      delete (window as any).Tawk_LoadStart;
    };
  }, [enabled]);

  return null;
}
