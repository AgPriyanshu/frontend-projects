import { Box, Card, Heading, Icon, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router";
import type { AppCard } from "./types";

type AppItemProps = {
  app: AppCard;
};

export const AppItem: React.FC<AppItemProps> = ({ app }) => {
  const navigate = useNavigate();
  return (
    <Card.Root
      key={app.title}
      width="150px"
      height="150px"
      cursor="pointer"
      onClick={() => navigate(app.route)}
      transition="all 0.2s"
      borderRadius={"xl"}
      borderWidth="1px"
      borderColor="border"
      _hover={{
        transform: "translateY(-4px)",
        shadow: "lg",
        borderColor: "primaryHover",
      }}
    >
      <Card.Body padding={2} pt={6}>
        <VStack align="center" gap={4} height="full">
          <Box p={4} borderRadius="lg">
            <Icon as={app.icon} boxSize={8} color="icon" />
          </Box>

          <VStack align="center" gap={3} width="full">
            <Heading size="md">{app.title}</Heading>
          </VStack>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};
