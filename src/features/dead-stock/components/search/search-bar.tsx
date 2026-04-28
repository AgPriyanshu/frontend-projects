import { Box, Input, InputGroup, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useSearchAutocomplete } from "api/dead-stock";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof window.setTimeout> | undefined>(
    undefined
  );
  const skipDebounceRef = useRef(false);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (skipDebounceRef.current) {
      skipDebounceRef.current = false;
      return;
    }
    timeoutRef.current = window.setTimeout(() => onChange(draft), 300);
    return () => window.clearTimeout(timeoutRef.current);
  }, [draft, onChange]);

  const { data: suggestions = [] } = useSearchAutocomplete(draft);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const selectSuggestion = (suggestion: string) => {
    skipDebounceRef.current = true;
    setDraft(suggestion);
    window.clearTimeout(timeoutRef.current);
    onChange(suggestion);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!open || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]!);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showDropdown = open && suggestions.length > 0;

  return (
    <Box className="search-bar" position="relative" ref={containerRef}>
      <InputGroup startElement={<FiSearch />}>
        <Input
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search tools, fixtures, parts..."
          size="lg"
          bg="bg.panel"
        />
      </InputGroup>

      {showDropdown && (
        <Box
          className="search-bar-dropdown"
          position="absolute"
          top="calc(100% + 4px)"
          left={0}
          right={0}
          zIndex={20}
          bg="bg.panel"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="md"
          shadow="lg"
          overflow="hidden"
        >
          {suggestions.map((suggestion, index) => (
            <Box
              key={suggestion}
              px={4}
              py={2.5}
              cursor="pointer"
              bg={index === activeIndex ? "bg.muted" : "transparent"}
              _hover={{ bg: "bg.muted" }}
              display="flex"
              alignItems="center"
              gap={2}
              onMouseDown={(event) => {
                // Prevent input blur before click registers.
                event.preventDefault();
                selectSuggestion(suggestion);
              }}
            >
              <FiSearch
                size={12}
                color="var(--chakra-colors-fg)"
                opacity={0.4}
              />
              <Text fontSize="sm">{suggestion}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
