import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";
import { useChat } from "./chat-context";

interface ChatButtonProps {
  onToggle?: (isOpen: boolean) => void;
  className?: string;
}

export function ChatButton({ onToggle, className }: ChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useChat();

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.(newState);
  };

  const hasUnreadMessages =
    state.messages.length > 0 &&
    state.messages[state.messages.length - 1]?.role === "assistant";

  return (
    <Button
      onClick={handleToggle}
      className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-40 ${className}`}
      size="lg"
      aria-label="Toggle AI Chat"
    >
      <div className="relative">
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <Bot className="h-6 w-6" />
            {hasUnreadMessages && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </>
        )}
      </div>
    </Button>
  );
}
