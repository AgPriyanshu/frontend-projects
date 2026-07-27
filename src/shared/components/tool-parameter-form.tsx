import {
  Field,
  Input,
  NativeSelect,
  NumberInput,
  Switch,
  Textarea,
} from "@chakra-ui/react";
import type { ProcessingToolParam } from "api/web-gis";
import type { UseFormRegister } from "react-hook-form";

interface ToolParameterFormProps {
  parameters: ProcessingToolParam[];
  register: UseFormRegister<Record<string, unknown>>;
  errors: Record<string, { message?: string }>;
  isSubmitting: boolean;
  datasetOptions: Array<{ id: string; name: string; type: string }>;
}

export const ToolParameterForm = ({
  parameters,
  register,
  errors,
  isSubmitting,
  datasetOptions,
}: ToolParameterFormProps) => {
  return (
    <>
      {parameters.map((param) => (
        <Field.Root key={param.name} invalid={!!errors[param.name]}>
          <Field.Label>{param.label}</Field.Label>

          {param.type === "number" && (
            <NumberInput.Root disabled={isSubmitting}>
              <NumberInput.Input
                {...register(param.name, {
                  valueAsNumber: true,
                  value: param.default as number | undefined,
                })}
                placeholder={String(param.default ?? "")}
              />
            </NumberInput.Root>
          )}

          {param.type === "string" && (
            <Input
              {...register(param.name)}
              placeholder={param.placeholder ?? String(param.default ?? "")}
              disabled={isSubmitting}
            />
          )}

          {param.type === "boolean" && (
            <Switch.Root {...register(param.name)} disabled={isSubmitting}>
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label />
            </Switch.Root>
          )}

          {param.type === "select" && (
            <NativeSelect.Root disabled={isSubmitting}>
              <NativeSelect.Field
                {...register(param.name)}
                defaultValue={String(param.default ?? "")}
              >
                {(param.options ?? []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          )}

          {param.type === "dataset" && (
            <NativeSelect.Root disabled={isSubmitting}>
              <NativeSelect.Field {...register(param.name)}>
                <option value="">Select a dataset…</option>
                {datasetOptions
                  .filter(
                    (d) => !param.datasetType || d.type === param.datasetType
                  )
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          )}

          {param.type === "expression" && (
            <Textarea
              {...register(param.name)}
              placeholder={param.placeholder ?? ""}
              disabled={isSubmitting}
              rows={3}
            />
          )}

          {errors[param.name] && (
            <Field.ErrorText>{errors[param.name].message}</Field.ErrorText>
          )}
        </Field.Root>
      ))}
    </>
  );
};
