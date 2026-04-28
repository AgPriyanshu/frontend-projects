import { useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { LocalStorageManager } from "shared/local-storage";

const CONSENT_KEY = "ds:consent:v1";

export const ConsentBanner = () => {
  const [dismissed, setDismissed] = useState(() =>
    LocalStorageManager.hasItem(CONSENT_KEY)
  );

  const handleAccept = () => {
    LocalStorageManager.setItem(CONSENT_KEY, "accepted");
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Box
      className="consent-banner"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={1000}
      bg="surface.default"
      borderTopWidth="1px"
      borderColor="border.default"
      px={8}
      py={3}
      shadow="lg"
    >
      <Flex align="center" justify="space-between" gap={4} wrap="wrap">
        <Text fontSize="sm" color="text.secondary" flex="1">
          We use cookies and local storage for login and to remember your
          preferences. No third-party tracking.
        </Text>
        <Button
          size="sm"
          bg="intent.primary"
          color="text.onIntent"
          onClick={handleAccept}
          flexShrink={0}
        >
          OK, got it
        </Button>
      </Flex>
    </Box>
  );
};
