import {
  Box,
  Button,
  Dialog,
  Field,
  Flex,
  Input,
  NativeSelect,
  Portal,
  Text,
} from "@chakra-ui/react";
import {
  useCreateEmployee,
  useUpdateEmployee,
} from "api/workload/workload-api";
import type { Employee } from "api/workload/types";
import { useForm } from "react-hook-form";

interface EmployeeFormValues {
  name: string;
  email: string;
  designation: string;
  capacity: number;
  manager: string;
}

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  employees: Employee[];
  editing?: Employee | null;
}

export const EmployeeForm = ({
  open,
  onClose,
  employees,
  editing,
}: EmployeeFormProps) => {
  const { mutate: create, isPending: isCreating } = useCreateEmployee();
  const { mutate: update, isPending: isUpdating } = useUpdateEmployee(
    editing?.id ?? ""
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    defaultValues: {
      name: editing?.name ?? "",
      email: editing?.email ?? "",
      designation: editing?.designation ?? "",
      capacity: editing?.capacity ?? 5,
      manager: editing?.manager ?? "",
    },
  });

  const isPending = isCreating || isUpdating;

  const onSubmit = (values: EmployeeFormValues) => {
    const payload = {
      name: values.name,
      email: values.email || undefined,
      designation: values.designation,
      capacity: Number(values.capacity),
      manager: values.manager || null,
    };

    if (editing) {
      update(payload, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    } else {
      create(payload, {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  const managersAvailable = employees.filter((e) => e.id !== editing?.id);

  return (
    <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content className="employee-form" maxW="480px">
            <Dialog.Header>
              <Dialog.Title>
                {editing ? "Edit Person" : "Add Person"}
              </Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Box
                as="form"
                id="employee-form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Flex direction="column" gap={4}>
                  <Field.Root invalid={!!errors.name} required>
                    <Field.Label>Name</Field.Label>
                    <Input
                      {...register("name", { required: "Name is required" })}
                      placeholder="Jane Smith"
                    />
                    {errors.name && (
                      <Field.ErrorText>{errors.name.message}</Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root invalid={!!errors.designation} required>
                    <Field.Label>Designation</Field.Label>
                    <Input
                      {...register("designation", {
                        required: "Designation is required",
                      })}
                      placeholder="Engineering Manager"
                    />
                    {errors.designation && (
                      <Field.ErrorText>
                        {errors.designation.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Email</Field.Label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="jane@company.com"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>
                      Capacity{" "}
                      <Text as="span" color="gray.400" fontSize="xs">
                        (max active tasks)
                      </Text>
                    </Field.Label>
                    <Input
                      {...register("capacity", { min: 1 })}
                      type="number"
                      min={1}
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Reports to</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field {...register("manager")}>
                        <option value="">— No manager (root) —</option>
                        {managersAvailable.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} · {emp.designation}
                          </option>
                        ))}
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                </Flex>
              </Box>
            </Dialog.Body>

            <Dialog.Footer>
              <Button variant="ghost" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button
                type="submit"
                form="employee-form"
                bg="intent.primary"
                color="white"
                _hover={{ bg: "intent.primaryHover" }}
                loading={isPending}
              >
                {editing ? "Save" : "Add"}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
