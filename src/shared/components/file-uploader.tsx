import { useRef } from "react";
import { Box, Input } from "@chakra-ui/react";
import { FaPlus, FaUpload } from "react-icons/fa";

export interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  disabled?: boolean;
}

export const FileUploader = ({
  onFileSelect,
  accept,
  multiple = false,
  maxSize,
  disabled = false,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
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
    <Box>
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
        px={3}
        py={2}
        borderRadius="md"
        bg="transparent"
        color="fg"
        fontSize="sm"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
        transition="all 0.2s"
        _hover={!disabled ? { bg: "primaryHover" } : {}}
        display="flex"
        alignItems="center"
        gap={2}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <FaUpload />
        Upload
      </Box>
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
        color="brand.fg"
        fontSize="sm"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.5 : 1}
        transition="all 0.2s"
        _hover={!disabled ? { color: "fg", transform: "scale(1.1)" } : {}}
        p={1}
        borderRadius="sm"
        pointerEvents={disabled ? "none" : "auto"}
      >
        {icon}
      </Box>
    </Box>
  );
};
