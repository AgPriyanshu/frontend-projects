import { useState, useRef, type KeyboardEvent } from "react";
import { Flex, Input, IconButton } from "@chakra-ui/react";
import { FiSend } from "react-icons/fi";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled = false }: ChatInputProps) => {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Flex
      gap={2}
      p={3}
      borderTopWidth="1px"
      borderColor="border.default"
      bg="surface.container"
    >
      <Input
        ref={inputRef}
        flex={1}
        placeholder="Type a message…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        variant="outline"
        size="sm"
        borderRadius="lg"
        bg="surface.page"
        color="text.primary"
        _placeholder={{ color: "text.muted" }}
        borderColor="border.default"
        _focus={{
          borderColor: "intent.primary",
          boxShadow: "0 0 0 1px var(--chakra-colors-intent-primary)",
        }}
      />
      <IconButton
        aria-label="Send message"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        size="sm"
        borderRadius="lg"
        bg="intent.primary"
        color="text.onIntent"
        _hover={{ bg: "intent.primaryHover" }}
        _disabled={{ opacity: 0.4, cursor: "not-allowed" }}
        transition="all 0.15s ease"
      >
        <FiSend />
      </IconButton>
    </Flex>
  );
};
