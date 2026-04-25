import { Box, Flex, Icon, IconButton } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { FaCamera, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { AvatarDisplay } from "./avatar-display";

const AVATAR_OPTIONS = [
  "🧙",
  "🥷",
  "🦇",
  "⚔️",
  "🧝",
  "🧟",
  "🧛",
  "🦁",
  "🐉",
  "🦊",
  "🐺",
  "🦅",
  "💀",
  "🛡️",
  "👑",
  "🔮",
  "💎",
  "🌙",
  "⚡",
  "🦄",
  "🐻",
  "🐯",
  "🏹",
  "🪄",
  "🧿",
  "🔥",
  "❄️",
  "🌊",
  "🌋",
  "☄️",
  "🌀",
  "🎭",
];

type AvatarCarouselProps = {
  avatar: string;
  onSelect: (avatar: string) => void;
};

const isImageSrc = (src: string) =>
  src.startsWith("data:") || src.startsWith("http");

export const AvatarCarousel: React.FC<AvatarCarouselProps> = ({
  avatar,
  onSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);

  const initialIndex = isImageSrc(avatar)
    ? 0
    : Math.max(0, AVATAR_OPTIONS.indexOf(avatar));

  const [localIndex, setLocalIndex] = useState(initialIndex);

  // When a file upload comes in, display the image directly via the avatar prop.
  const displayAvatar = isImageSrc(avatar)
    ? avatar
    : AVATAR_OPTIONS[localIndex];

  const prev = () => {
    const idx =
      (localIndex - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length;
    setLocalIndex(idx);
    onSelect(AVATAR_OPTIONS[idx]);
  };

  const next = () => {
    const idx = (localIndex + 1) % AVATAR_OPTIONS.length;
    setLocalIndex(idx);
    onSelect(AVATAR_OPTIONS[idx]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === "string") onSelect(result);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const prevEmoji =
    AVATAR_OPTIONS[
      (localIndex - 1 + AVATAR_OPTIONS.length) % AVATAR_OPTIONS.length
    ];
  const nextEmoji = AVATAR_OPTIONS[(localIndex + 1) % AVATAR_OPTIONS.length];

  return (
    <Flex className="avatar-carousel" align="center" gap={1} flexShrink={0}>
      {/* Previous ghost */}
      <Flex
        w="40px"
        h="40px"
        align="center"
        justify="center"
        borderRadius="lg"
        fontSize="2xl"
        opacity={0.3}
        cursor="pointer"
        transition="opacity 0.15s"
        _hover={{ opacity: 0.6 }}
        onClick={prev}
        userSelect="none"
      >
        {prevEmoji}
      </Flex>

      {/* Left arrow */}
      <IconButton
        aria-label="Previous avatar"
        size="xs"
        variant="ghost"
        color="text.muted"
        borderRadius="full"
        _hover={{ color: "intent.primary", bg: "surface.subtle" }}
        onClick={prev}
      >
        <Icon as={FaChevronLeft} boxSize={3} />
      </IconButton>

      {/* Current avatar — click to upload */}
      <Box
        position="relative"
        cursor="pointer"
        flexShrink={0}
        onClick={() => inputRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AvatarDisplay
          avatar={displayAvatar}
          size="lg"
          borderColor={hovered ? "intent.primary" : "border.default"}
        />
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
          <Icon as={FaCamera} color="white" boxSize={5} />
        </Box>
      </Box>

      {/* Right arrow */}
      <IconButton
        aria-label="Next avatar"
        size="xs"
        variant="ghost"
        color="text.muted"
        borderRadius="full"
        _hover={{ color: "intent.primary", bg: "surface.subtle" }}
        onClick={next}
      >
        <Icon as={FaChevronRight} boxSize={3} />
      </IconButton>

      {/* Next ghost */}
      <Flex
        w="40px"
        h="40px"
        align="center"
        justify="center"
        borderRadius="lg"
        fontSize="2xl"
        opacity={0.3}
        cursor="pointer"
        transition="opacity 0.15s"
        _hover={{ opacity: 0.6 }}
        onClick={next}
        userSelect="none"
      >
        {nextEmoji}
      </Flex>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Flex>
  );
};
