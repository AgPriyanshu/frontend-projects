import { Button, Flex, Input } from "@chakra-ui/react";
import type { LoadStatus } from "api/workload";
import { FaPlus, FaSitemap } from "react-icons/fa6";
import { filterOptions } from "./constants";

export type FilterStatus = LoadStatus | "ALL";

interface WorkloadToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filterStatus: FilterStatus;
  onFilterChange: (value: FilterStatus) => void;
  onAddPerson: () => void;
}

export const WorkloadToolbar = ({
  search,
  onSearchChange,
  filterStatus,
  onFilterChange,
  onAddPerson,
}: WorkloadToolbarProps) => {
  return (
    <Flex
      className="workload-toolbar"
      align="center"
      gap={3}
      px={4}
      py={3}
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="surface.container"
      flexShrink={0}
    >
      <Flex align="center" gap={2} color="text.primary">
        <FaSitemap />
      </Flex>

      <Input
        placeholder="Search people..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        maxW="240px"
        size="sm"
      />

      <Flex gap={1}>
        {filterOptions.map((opt) => (
          <Button
            key={opt.value}
            size="xs"
            variant={filterStatus === opt.value ? "solid" : "outline"}
            bg={filterStatus === opt.value ? "intent.primary" : undefined}
            color={filterStatus === opt.value ? "white" : "text.secondary"}
            borderColor={
              filterStatus === opt.value ? "intent.primary" : "border.default"
            }
            _hover={{
              bg:
                filterStatus === opt.value
                  ? "intent.primaryHover"
                  : "surface.hover",
            }}
            onClick={() => onFilterChange(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </Flex>

      <Button
        size="sm"
        bg="intent.primary"
        color="white"
        _hover={{ bg: "intent.primaryHover" }}
        onClick={onAddPerson}
        ml="auto"
      >
        <FaPlus />
        Add Person
      </Button>
    </Flex>
  );
};
