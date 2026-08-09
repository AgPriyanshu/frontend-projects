import { Flex, IconButton, Input } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch, type SubmitHandler } from "react-hook-form";
import { FiSend, FiSquare } from "react-icons/fi";
import { type ChatInputData, chatInputSchema } from "./schemas";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isWaitingForResponse: boolean;
  disabled?: boolean;
}

export const ChatInput = ({
  onSend,
  onStop,
  isWaitingForResponse,
  disabled = false,
}: ChatInputProps) => {
  // Hooks.
  const { register, handleSubmit, control, reset } = useForm<ChatInputData>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { chatMessage: "" },
  });

  const chatMessage = useWatch({ control, name: "chatMessage" });

  // Handlers.
  const handleSend: SubmitHandler<ChatInputData> = ({ chatMessage }) => {
    onSend(chatMessage);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleSend)}>
      <Flex
        className="chat-input"
        gap={2}
        p={3}
        borderTopWidth="1px"
        borderColor="border.default"
        bg="surface.container"
      >
        <Input
          {...register("chatMessage")}
          type="text"
          flex={1}
          placeholder="Type a message…"
          disabled={disabled || isWaitingForResponse}
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
        {isWaitingForResponse ? (
          <IconButton
            type="button"
            aria-label="Stop response"
            size="sm"
            borderRadius="lg"
            bg="intent.danger"
            color="text.onIntent"
            _hover={{ bg: "intent.dangerHover" }}
            transition="all 0.15s ease"
            onClick={onStop}
          >
            <FiSquare />
          </IconButton>
        ) : (
          <IconButton
            type="submit"
            aria-label="Send message"
            disabled={disabled || !chatMessage}
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
        )}
      </Flex>
    </form>
  );
};
