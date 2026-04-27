import {
  Button,
  Field,
  Input,
  Textarea,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCategories, useCreateItem, useUpdateItem } from "api/dead-stock";
import type { DsItem } from "api/dead-stock";
import { ImageUploader } from "./image-uploader";

const itemSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  price: z.string().nullable().optional(),
  category: z.string().min(1, "Category is required"),
  condition: z.enum(["new", "open_box", "used"] as const),
  description: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

interface ItemFormProps {
  initialData?: DsItem;
  onClose: () => void;
}

export const ItemForm = ({ initialData, onClose }: ItemFormProps) => {
  const { data: categories = [] } = useCategories();
  const createItem = useCreateItem();
  const updateItem = useUpdateItem();

  const isEditing = !!initialData;
  const [activeItemId, setActiveItemId] = useState(initialData?.id);
  const [imageState, setImageState] = useState({
    count: initialData?.images.length ?? 0,
    hasPrimary: initialData?.images.some((image) => image.isPrimary) ?? false,
  });
  const canFinish = imageState.count > 0 && imageState.hasPrimary;
  const handleImagesChange = useCallback(
    (state: { count: number; hasPrimary: boolean }) => setImageState(state),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: initialData?.name || "",
      quantity: initialData?.quantity || 1,
      price: initialData?.price || "",
      category: initialData?.category || "",
      condition: initialData?.condition || "new",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (data: ItemFormValues) => {
    try {
      const payload = {
        ...data,
        price: data.price || null,
      };

      if (activeItemId) {
        await updateItem.mutateAsync({
          id: activeItemId,
          ...payload,
        });
        onClose();
      } else {
        const created = await createItem.mutateAsync(payload);
        setActiveItemId(created.id);
      }
    } catch (error) {
      console.error("Failed to save item:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <VStack gap={4} align="stretch">
        <ImageUploader
          itemId={activeItemId}
          onImagesChange={handleImagesChange}
        />

        <Field.Root invalid={!!errors.name}>
          <Field.Label>Name *</Field.Label>
          <Input {...register("name")} placeholder="Item name" />
          {errors.name && (
            <Field.ErrorText>{errors.name.message}</Field.ErrorText>
          )}
        </Field.Root>

        <HStack gap={4} align="start">
          <Field.Root invalid={!!errors.quantity} flex={1}>
            <Field.Label>Quantity *</Field.Label>
            <Input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
            />
            {errors.quantity && (
              <Field.ErrorText>{errors.quantity.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.price} flex={1}>
            <Field.Label>Price (optional)</Field.Label>
            <Input {...register("price")} placeholder="0.00" />
            {errors.price && (
              <Field.ErrorText>{errors.price.message}</Field.ErrorText>
            )}
          </Field.Root>
        </HStack>

        <Field.Root invalid={!!errors.category}>
          <Field.Label>Category *</Field.Label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid var(--chakra-colors-border-default)",
                  background: "var(--chakra-colors-bg-panel)",
                }}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.category && (
            <Field.ErrorText>{errors.category.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.condition}>
          <Field.Label>Condition *</Field.Label>
          <Controller
            name="condition"
            control={control}
            render={({ field }) => (
              <HStack gap={2}>
                {(["new", "open_box", "used"] as const).map((cond) => (
                  <Button
                    key={cond}
                    size="sm"
                    variant={field.value === cond ? "solid" : "outline"}
                    onClick={() => field.onChange(cond)}
                    type="button"
                  >
                    {cond === "new"
                      ? "New"
                      : cond === "open_box"
                        ? "Open Box"
                        : "Used"}
                  </Button>
                ))}
              </HStack>
            )}
          />
          {errors.condition && (
            <Field.ErrorText>{errors.condition.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Field.Root invalid={!!errors.description}>
          <Field.Label>Description</Field.Label>
          <Textarea
            {...register("description")}
            placeholder="Add details..."
            rows={3}
          />
          {errors.description && (
            <Field.ErrorText>{errors.description.message}</Field.ErrorText>
          )}
        </Field.Root>

        <HStack justify="flex-end" pt={4}>
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!!activeItemId && !canFinish}
          >
            {activeItemId
              ? isEditing
                ? "Save changes"
                : "Finish"
              : "Create item details"}
          </Button>
        </HStack>
        {activeItemId && !canFinish && (
          <Text color="intent.danger" fontSize="sm" textAlign="right">
            Add at least one image and mark a primary image before saving.
          </Text>
        )}
      </VStack>
    </form>
  );
};
