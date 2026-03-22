import { Box, Button, Input } from "@chakra-ui/react";
import { useRef } from "react";
import { FaUpload } from "react-icons/fa";

export interface FileUploaderProps {
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const FileUploadInput = ({
  onFileSelect,
  accept,
  multiple = false,
  disabled = false,
  inputRef,
}: FileUploaderProps) => {
  // Refs.
  const internalInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = inputRef ?? internalInputRef;

  // Handler.s
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }

    onFileSelect(files);

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
