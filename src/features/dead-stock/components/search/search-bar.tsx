import { Input, InputGroup } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    const timeout = window.setTimeout(() => onChange(draft), 300);
    return () => window.clearTimeout(timeout);
  }, [draft, onChange]);

  return (
    <InputGroup startElement={<FiSearch />}>
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search tools, fixtures, parts..."
        size="lg"
        bg="bg.panel"
      />
    </InputGroup>
  );
};
