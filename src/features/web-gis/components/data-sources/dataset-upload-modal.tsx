import {
  Box,
  Button,
  Dialog,
  List,
  Portal,
  Text,
  VStack,
  Progress,
} from "@chakra-ui/react";
import { queryClient } from "api/query-client";
import { QueryKeys } from "api/query-keys";
import { useUploadDatasets, useMultipartUpload } from "api/web-gis";
import { DatasetNodeType } from "../../types";
import { useState } from "react";
import { FiTrash2, FiUploadCloud } from "react-icons/fi";
import { FileUploader } from "shared/components";

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
  const [datasetType, setDatasetType] = useState<string | undefined>(undefined);

  // API.
  const { mutateAsync: uploadDataset, isPending: isStandardPending } =
    useUploadDatasets();
  const {
    uploadFile: uploadMultipart,
    progress: multipartProgress,
    isPending: isMultipartPending,
  } = useMultipartUpload();

  const isPending = isStandardPending || isMultipartPending;

  // Handlers.
  const handleFileSelect = (fileList: FileList) => {
    setFiles((prev) => [...prev, ...Array.from(fileList)]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    // Threshold for multipart upload (e.g., 50MB)
    const MULTIPART_THRESHOLD = 50 * 1024 * 1024;

    const smallFiles = files.filter((f) => f.size <= MULTIPART_THRESHOLD);
    const largeFiles = files.filter((f) => f.size > MULTIPART_THRESHOLD);

    try {
      // Upload small files in batch
      if (smallFiles.length > 0) {
        await uploadDataset({
          name: "",
          type: DatasetNodeType.DATASET,
          parent: parentId,
          files: smallFiles,
          dataset_type: datasetType as any,
        });
      }

      // Upload large files individually using multipart
      for (const file of largeFiles) {
        await uploadMultipart(file, parentId, datasetType);
      }

      // Success
      queryClient.invalidateQueries({ queryKey: QueryKeys.datasets });
      setFiles([]);
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      // Toast error?
    }
  };

  const handleClose = () => {
    setFiles([]);
    setDatasetType(undefined);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && handleClose()}>
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
                  Select dataset files (e.g., GeoTIFF, Shapefiles, GeoJSON,
                  etc.) to upload.
                </Text>

                <Box mb={2}>
                  <Text mb={1} fontSize="sm" fontWeight="medium">
                    Content Type Override (Optional)
                  </Text>
                  <select
                    style={{
                      padding: "8px",
                      width: "100%",
                      borderRadius: "6px",
                      border: "1px solid var(--chakra-colors-border-default)",
                      backgroundColor: "var(--chakra-colors-bg-panel)",
                    }}
                    value={datasetType || ""}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setDatasetType(e.target.value || undefined)
                    }
                  >
                    <option value="">Auto-detect from file</option>
                    <option value="raster-dem">
                      Digital Elevation Model (DEM)
                    </option>
                  </select>
                </Box>

                <Box
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="border.default"
                  borderRadius="md"
                  p={6}
                  textAlign="center"
                  bg="bg.surface"
                >
                  <FileUploader onFileSelect={handleFileSelect} multiple />
                </Box>

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

                {isMultipartPending && (
                  <Box>
                    <Text fontSize="xs" mb={1} color="text.secondary">
                      Uploading large file... {multipartProgress}%
                    </Text>
                    <Progress.Root value={multipartProgress} size="sm">
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
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
                type="button"
                colorPalette="blue"
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
