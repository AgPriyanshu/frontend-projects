import { useEffect, useRef } from "react";
import { reaction } from "mobx";
import { chatStore } from "../store/chat-store";
import { AgentExecutor } from "../agent/agent-executor";
import { registerAllHandlers } from "../agent/register-handlers";
import type { RawUIAction } from "../agent/types";

// Ensure handlers are registered exactly once.
let handlersRegistered = false;

/**
 * Global hook that watches `chatStore.pendingUIActions` and dispatches
 * them through the AgentExecutor.
 *
 * Mount this once in the root App component so it runs regardless
 * of which feature page the user is on.
 */
export const useAgentExecutor = () => {
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!handlersRegistered) {
      registerAllHandlers();
      handlersRegistered = true;
    }
  }, []);

  useEffect(() => {
    const dispose = reaction(
      () => chatStore.pendingUIActions.length,
      async (length) => {
        if (!length || isProcessing.current) return;

        isProcessing.current = true;

        try {
          const actions = chatStore.pendingUIActions.slice() as RawUIAction[];
          chatStore.clearPendingUIActions();
          const results = await AgentExecutor.executeBatch(actions);

          // Log results for observability.
          for (const result of results) {
            if (!result.success) {
              console.warn(
                `[useAgentExecutor] Action failed: ${result.app}/${result.actionType} — ${result.error}`
              );
            }
          }
        } finally {
          isProcessing.current = false;
        }
      }
    );

    return dispose;
  }, []);
};
