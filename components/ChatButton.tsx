"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  text: string;
}

export function ChatButton({ text }: ChatButtonProps) {
  const handleChatClick = () => {
    // Check if Tawk.to is loaded
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.maximize();
    } else {
      // Fallback: Open a contact form or show message
      alert("Live chat is loading. Please wait a moment or refresh the page.");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleChatClick}>
      <MessageCircle className="h-4 w-4 mr-2" />
      {text}
    </Button>
  );
}
