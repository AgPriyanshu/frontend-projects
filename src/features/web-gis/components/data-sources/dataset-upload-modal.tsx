import {
  Box,
  Button,
  Center,
  Dialog,
  List,
  Portal,
  Text,
  VStack,
} from "@chakra-ui/react";
import type { DialogOpenChangeDetails } from "@chakra-ui/react/dialog";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useMultipartUpload, useUploadDatasets } from "api/web-gis";
import { toaster } from "design-system/toaster";
import { useEffect, useRef, useState } from "react";
import { FiUploadCloud } from "react-icons/fi";
import { DeleteIconButton, FileUploader } from "shared/components";
import { DatasetNodeType } from "../../types";

const UPLOAD_TOAST_ID = "dataset-upload-progress";
const MULTIPART_THRESHOLD_IN_BYTES = 50 * 1024 * 1024;
const UPLOAD_TOAST_TITLE = "Uploading datasets";
const TOAST_OPTIONS = { closable: true } as const;

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export const DatasetUploadModal = ({
  isOpen,
  onClose,
  parentId = null,
}: DatasetUploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: uploadDataset, isPending: isStandardPending } =
    useUploadDatasets();

  const {
    uploadFile: uploadMultipart,
    progress: multipartProgress,
    isPending: isMultipartPending,
  } = useMultipartUpload();

  const isPending = isStandardPending || isMultipartPending;

  const updateUploadToast = (description: string) => {
    toaster.update(UPLOAD_TOAST_ID, {
      title: UPLOAD_TOAST_TITLE,
      description,
      type: "loading",
      ...TOAST_OPTIONS,
    });
  };

  useEffect(() => {
    if (!isMultipartPending) {
      return;
    }

    updateUploadToast(`Uploading large files... ${multipartProgress}%`);
  }, [isMultipartPending, multipartProgress]);

  const handleFileSelect = (fileList: FileList) => {
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilePickerKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    handleOpenFilePicker();
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      return;
    }

    const totalFiles = files.length;
    const smallFiles = files.filter(
      (file) => file.size <= MULTIPART_THRESHOLD_IN_BYTES
    );
    const largeFiles = files.filter(
      (file) => file.size > MULTIPART_THRESHOLD_IN_BYTES
    );

    handleClose();

    try {
      toaster.create({
        id: UPLOAD_TOAST_ID,
        title: UPLOAD_TOAST_TITLE,
        description: "Preparing upload...",
        type: "loading",
        ...TOAST_OPTIONS,
      });

      if (smallFiles.length > 0) {
        updateUploadToast(`Uploading ${smallFiles.length} standard file(s)...`);

        await uploadDataset({
          name: "",
          type: DatasetNodeType.DATASET,
          parent: parentId,
          files: smallFiles,
        });
      }

      for (const file of largeFiles) {
        updateUploadToast(`Uploading large file: ${file.name}`);

        await uploadMultipart(file, parentId);
      }

      queryClient.invalidateQueries({ queryKey: QueryKeys.datasets });

      toaster.update(UPLOAD_TOAST_ID, {
        title: "Upload complete",
        description: `${totalFiles} file(s) uploaded successfully.`,
        type: "success",
        closable: true,
      });
    } catch (error) {
      console.error("Upload failed", error);

      toaster.update(UPLOAD_TOAST_ID, {
        title: "Upload failed",
        description: "Some files could not be uploaded. Please try again.",
        type: "error",
        ...TOAST_OPTIONS,
      });
    }
  };

  const onDialogOpenChange = (details: DialogOpenChangeDetails) => {
    if (details.open === false) {
      handleClose();
    }
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={onDialogOpenChange}
      placement={"center"}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Upload Dataset</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <VStack align="stretch" gap={4}>
                <Text fontSize="sm" color="text.secondary">
                  Select dataset files (e.g., GeoTIFF, Shapefiles, etc.) to
                  upload.
                </Text>

                <Center
                  role="button"
                  tabIndex={0}
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="border.default"
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  bg="bg.surface"
                  cursor="pointer"
                  onClick={handleOpenFilePicker}
                  onKeyDown={handleFilePickerKeyDown}
                  _hover={{ borderColor: "intent.primaryHover" }}
                >
                  <FileUploader
                    onFileSelect={handleFileSelect}
                    multiple
                    inputRef={fileInputRef}
                  />
                </Center>

                {files.length > 0 && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Selected Files ({files.length})
                    </Text>
                    <List.Root variant="plain">
                      {files.map((file, index) => (
                        <List.Item
                          key={`${file.name}-${index}`}
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          bg="bg.panel"
                          p={2}
                          borderRadius="md"
                          listStyleType="none"
                        >
                          <Text fontSize="sm" truncate maxW="80%">
                            {file.name}
                          </Text>
                          <DeleteIconButton
                            onClick={() => handleRemoveFile(index)}
                          />
                        </List.Item>
                      ))}
                    </List.Root>
                  </Box>
                )}
              </VStack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="ghost" mr={3} onClick={handleClose}>
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Button
                bgColor={"intent.primary"}
                color={"white"}
                colorPalette={"palette.brand"}
                onClick={handleUpload}
                loading={isPending && multipartProgress === 0}
                disabled={files.length === 0 || isPending}
              >
                <FiUploadCloud /> Upload
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
