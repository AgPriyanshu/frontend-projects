import { Box } from "@chakra-ui/react";

type AvatarDisplayProps = {
  avatar: string;
  size: "sm" | "lg";
  borderColor?: string;
};

const isImageSrc = (src: string) =>
  src.startsWith("data:") || src.startsWith("http");

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  size,
  borderColor = "border.default",
}) => {
  const dimension = size === "lg" ? "100px" : "52px";
  const fontSize = size === "lg" ? "7xl" : "3xl";
  const radius = size === "lg" ? "xl" : "lg";

  return (
    <Box
      className="avatar-display"
      w={dimension}
      h={dimension}
      flexShrink={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius={radius}
      borderWidth="1px"
      borderColor={borderColor}
      bg="surface.container"
      overflow="hidden"
    >
      {isImageSrc(avatar) ? (
        <img
          src={avatar}
          alt="avatar"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            imageRendering: "pixelated",
          }}
        />
      ) : (
        <Box
          fontSize={fontSize}
          lineHeight="1"
          style={{ imageRendering: "pixelated" }}
        >
          {avatar}
        </Box>
      )}
    </Box>
  );
};
