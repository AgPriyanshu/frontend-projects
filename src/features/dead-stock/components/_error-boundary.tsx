import * as Sentry from "@sentry/react";
import { Box, Button, Center, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

const FallbackUI = ({ resetError }: { resetError: () => void }) => (
  <Center className="ds-error-boundary-fallback" h="full" p={8}>
    <VStack gap={4} maxW="sm" textAlign="center">
      <Text fontSize="2xl">Something went wrong</Text>
      <Text color="text.secondary" fontSize="sm">
        An unexpected error occurred. The issue has been reported.
      </Text>
      <Box>
        <Button
          size="sm"
          bg="intent.primary"
          color="text.onIntent"
          onClick={resetError}
          mr={2}
        >
          Try again
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh page
        </Button>
      </Box>
    </VStack>
  </Center>
);

interface DeadStockErrorBoundaryProps {
  children: ReactNode;
}

export const DeadStockErrorBoundary = ({
  children,
}: DeadStockErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    fallback={({ resetError }) => <FallbackUI resetError={resetError} />}
  >
    {children}
  </Sentry.ErrorBoundary>
);
