import { Heading, VStack } from "@chakra-ui/react";
import { TbWorldBolt } from "react-icons/tb";
import { useNavigate } from "react-router";

export const WorldOfAppsLogo = () => {
  const navigate = useNavigate();
  return (
    <VStack
      cursor="pointer"
      mt={"4rem"}
      gap={"0.5rem"}
      onClick={() => navigate("/")}
    >
      <Heading size={"2xl"}>World of Apps</Heading>
      <TbWorldBolt size={48} />
    </VStack>
  );
};
