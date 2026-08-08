import { Box, Center, Flex, Spinner, Text } from "@chakra-ui/react";
import { type Employee, type LoadStatus, useEmployeeTree } from "api/workload";
import { useMemo, useState } from "react";
import {
  EmployeeDetailPanel,
  EmployeeForm,
  OrgGraphContainer,
} from "./components";
import { WorkloadToolbar } from "./components/workload-toolbar/workload-toolbar";

type FilterStatus = LoadStatus | "ALL";

export const WorkloadTreePage = () => {
  // States.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // APIs.
  const { data: employees, isPending, isError } = useEmployeeTree();

  // Memos.
  const allEmployees = useMemo(() => employees ?? [], [employees]);
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(search.toLowerCase()) ||
        employee.designation.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filterStatus === "ALL" || employee.loadStatus === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [allEmployees, search, filterStatus]);

  // Variables
  const selectedEmployee =
    allEmployees.find((employee) => employee.id === selectedId) ?? null;

  // Handlers.
  const openAddForm = () => {
    setEditingEmployee(null);
    setFormOpen(true);
  };

  const openEditForm = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormOpen(true);
  };

  // Renders.
  if (isPending) {
    return (
      <Center w="full" h="full">
        <Spinner size="xl" color="intent.primary" />
      </Center>
    );
  }

  if (isError) {
    return (
      <Center w="full" h="full">
        <Text color="text.danger">Failed to load the org chart.</Text>
      </Center>
    );
  }

  return (
    <Flex className="workload-tree-page" direction="column" w="full" h="full">
      <WorkloadToolbar
        search={search}
        onSearchChange={setSearch}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
        onAddPerson={openAddForm}
      />

      <Box flex={1} position="relative" overflow="hidden">
        {filteredEmployees.length === 0 ? (
          <Center h="full">
            <Text color="text.muted">
              {allEmployees.length === 0
                ? "No people yet. Add someone to get started."
                : "No people match the current filter."}
            </Text>
          </Center>
        ) : (
          <OrgGraphContainer
            employees={filteredEmployees}
            selectedId={selectedId}
            onSelectEmployee={setSelectedId}
          />
        )}
      </Box>

      {selectedEmployee && (
        <EmployeeDetailPanel
          employee={selectedEmployee}
          onClose={() => setSelectedId(null)}
          onEdit={openEditForm}
        />
      )}

      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        employees={allEmployees}
        editing={editingEmployee}
      />
    </Flex>
  );
};
