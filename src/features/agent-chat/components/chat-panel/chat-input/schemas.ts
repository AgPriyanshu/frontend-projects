import z from "zod";

export const chatInputSchema = z.object({
  chatMessage: z.string().trim().min(1),
});

export type ChatInputData = z.infer<typeof chatInputSchema>;
