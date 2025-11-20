"use client";

import { useEffect } from "react";

export function LiveChat() {
  useEffect(() => {
    // Only load if in browser
    if (typeof window === "undefined") return;

    // Tawk.to Live Chat Widget
    // To enable live chat:
    // 1. Sign up at https://www.tawk.to/ (free)
    // 2. Get your Property ID and Widget ID from dashboard
    // 3. Add to .env.local: NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID
    // 4. Uncomment the code below and replace the demo IDs
    
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
  }, []);

  return null;
}
