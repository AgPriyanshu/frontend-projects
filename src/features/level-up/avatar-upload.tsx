import { Box, Icon } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { AvatarDisplay } from "./avatar-display";

type AvatarUploadProps = {
  avatar: string;
  onUpload: (dataUrl: string) => void;
};

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatar,
  onUpload,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") onUpload(result);
    };
    reader.readAsDataURL(file);

    // Reset the input so the same file can be re-selected.
    e.target.value = "";
  };

  return (
    <Box
      className="avatar-upload"
      position="relative"
      cursor="pointer"
      flexShrink={0}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AvatarDisplay
        avatar={avatar}
        size="lg"
        borderColor={hovered ? "intent.primary" : "border.default"}
      />

      {/* Camera overlay */}
      <Box
        position="absolute"
        inset={0}
        borderRadius="xl"
        bg="blackAlpha.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        opacity={hovered ? 1 : 0}
        transition="opacity 0.15s"
        pointerEvents="none"
      >
        <Icon as={FaCamera} color="white" boxSize={6} />
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};
