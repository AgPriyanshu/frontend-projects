import {
  Box,
  Button,
  Dialog,
  List,
  Portal,
  Text,
  VStack,
  Center,
} from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useUploadDatasets, useMultipartUpload } from "api/web-gis";
import { toaster } from "design-system/toaster-instance";
import { DatasetNodeType } from "../../types";
import { useEffect, useRef, useState } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { FileUploader } from "shared/components";

const UPLOAD_TOAST_ID = "dataset-upload-progress";

interface DatasetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null; // Optional: specific parent folder ID.
}

export const DatasetUploadModal = ({
  isOpen,
  onClose,
  parentId = null,
}: DatasetUploadModalProps) => {
  // State.
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API.
  const { mutateAsync: uploadDataset, isPending: isStandardPending } =
    useUploadDatasets();
  const {
    uploadFile: uploadMultipart,
    progress: multipartProgress,
    isPending: isMultipartPending,
  } = useMultipartUpload();

  const isPending = isStandardPending || isMultipartPending;

  useEffect(() => {
    if (!isMultipartPending) {
      return;
    }

    toaster.update(UPLOAD_TOAST_ID, {
      title: "Uploading datasets",
      description: `Uploading large files... ${multipartProgress}%`,
      type: "loading",
      closable: true,
    });
  }, [isMultipartPending, multipartProgress]);

  // Handlers.
  const handleFileSelect = (fileList: FileList) => {
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    const totalFiles = files.length;

    // Threshold for multipart upload (e.g., 50MB)
    const MULTIPART_THRESHOLD = 50 * 1024 * 1024;

    const smallFiles = files.filter((f) => f.size <= MULTIPART_THRESHOLD);
    const largeFiles = files.filter((f) => f.size > MULTIPART_THRESHOLD);

    handleClose();

    try {
      toaster.create({
        id: UPLOAD_TOAST_ID,
        title: "Uploading datasets",
        description: "Preparing upload...",
        type: "loading",
        closable: true,
      });

      // Upload small files in batch
      if (smallFiles.length > 0) {
        toaster.update(UPLOAD_TOAST_ID, {
          title: "Uploading datasets",
          description: `Uploading ${smallFiles.length} standard file(s)...`,
          type: "loading",
          closable: true,
        });

        await uploadDataset({
          name: "",
          type: DatasetNodeType.DATASET,
          parent: parentId,
          files: smallFiles,
        });
      }

      // Upload large files individually using multipart
      for (const file of largeFiles) {
        toaster.update(UPLOAD_TOAST_ID, {
          title: "Uploading datasets",
          description: `Uploading large file: ${file.name}`,
          type: "loading",
          closable: true,
        });

        await uploadMultipart(file, parentId);
      }

      // Success
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
        closable: true,
      });
    }
  };

  const handleClose = () => {
    setFiles([]);
    onClose();
  };

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(e) => !e.open && handleClose()}
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
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
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
                          <Box
                            as="button"
                            onClick={() => handleRemoveFile(index)}
                            color="text.danger"
                            _hover={{ opacity: 0.8 }}
                          >
                            <FiTrash2 />
                          </Box>
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
