import { useRef } from "react";
import { Box, Button, Input } from "@chakra-ui/react";
import { FaPlus, FaUpload } from "react-icons/fa";

export interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const FileUploader = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  inputRef,
}: FileUploaderProps) => {
  const internalInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef ?? internalInputRef;

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file size if maxSize is provided
    if (maxSize) {
      const oversizedFiles = Array.from(files).filter(
        (file) => file.size > maxSize
      );
      if (oversizedFiles.length > 0) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        alert(
          `Some files exceed the maximum size of ${maxSizeMB}MB: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }
    }

    onFileSelect(files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        display="none"
        disabled={disabled}
      />
      <Button
        variant={"plain"}
        onClick={handleClick}
        px={3}
        py={2}
        borderRadius="md"
        fontSize="sm"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
        transition="all 0.2s"
        gap={2}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <FaUpload />
        Upload
      </Button>
    </Box>
  );
};

// Inline variant for compact spaces (like tree nodes)
export interface InlineFileUploaderProps extends FileUploaderProps {
  icon?: React.ReactElement;
  ariaLabel?: string;
}

export const InlineFileUploader = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
  icon = <FaPlus />,
  ariaLabel = "Upload file",
}: InlineFileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file size if maxSize is provided
    if (maxSize) {
      const oversizedFiles = Array.from(files).filter(
        (file) => file.size > maxSize
      );
      if (oversizedFiles.length > 0) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
        alert(
          `Some files exceed the maximum size of ${maxSizeMB}MB: ${oversizedFiles
            .map((f) => f.name)
            .join(", ")}`
        );
        return;
      }
    }

    onFileSelect(files);
    // Reset input value to allow selecting the same file again
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <Box display="inline-block">
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileChange}
        display="none"
        disabled={disabled}
      />
      <Box
        as="button"
        onClick={handleClick}
        aria-label={ariaLabel}
        fontSize="sm"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
        transition="all 0.2s"
        _hover={
          !disabled
            ? {
                color: "text.success",
                transform: "scale(1.1)",
                borderColor: "intent.primaryHover",
              }
            : {}
        }
        p={1}
        borderRadius="sm"
        pointerEvents={disabled ? "none" : "auto"}
      >
        {icon}
      </Box>
    </Box>
  );
};
