import { Box, Card, Heading, Icon } from "@chakra-ui/react";
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
      width="8rem"
      height="8rem"
      cursor="pointer"
      onClick={() => navigate(app.route)}
      transition="all 0.2s"
      borderRadius={"xl"}
      borderWidth="1px"
      borderColor="border.default"
      _hover={{
        transform: "translateY(-4px)",
        shadow: "lg",
        borderColor: "intent.primaryHover",
      }}
    >
      <Card.Body
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={3}
      >
        <Box p={2} borderRadius="lg" bg="surface.subtle" mb={2}>
          <Icon as={app.icon} boxSize={6} color="icon.primary" />
        </Box>
        <Heading
          size="sm"
          textAlign="center"
          fontWeight="medium"
          lineHeight="short"
          noOfLines={2}
        >
          {app.title}
        </Heading>
      </Card.Body>
    </Card.Root>
  );
};
