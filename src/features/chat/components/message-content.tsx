import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Accordion, Box, Text } from "@chakra-ui/react";
import { LuChevronDown } from "react-icons/lu";

interface MessageContentProps {
  content: string;
}

interface ParsedContent {
  thinking: string | null;
  response: string;
}

const parseThinkingContent = (content: string): ParsedContent => {
  const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
  const thinkBlocks: string[] = [];
  let match;

  while ((match = thinkRegex.exec(content)) !== null) {
    thinkBlocks.push(match[1].trim());
  }

  if (thinkBlocks.length === 0) {
    return { thinking: null, response: content };
  }

  return {
    thinking: thinkBlocks.join("\n\n"),
    response: content.replace(/<think>[\s\S]*?<\/think>/g, "").trim(),
  };
};

const markdownStyles = {
  "& p": { margin: 0, lineHeight: 1.6 },
  "& p + p": { marginTop: "0.5em" },
  "& ul, & ol": { paddingLeft: "1.25em", margin: "0.4em 0" },
  "& li": { marginBottom: "0.2em" },
  "& code": {
    bg: "surface.subtle",
    px: "0.3em",
    py: "0.1em",
    borderRadius: "sm",
    fontSize: "0.85em",
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  "& pre": { margin: "0.5em 0", borderRadius: "md", overflow: "hidden" },
  "& table": {
    width: "100%",
    borderCollapse: "collapse",
    margin: "0.5em 0",
    fontSize: "0.9em",
  },
  "& th, & td": {
    border: "1px solid",
    borderColor: "border.default",
    padding: "0.4em 0.8em",
    textAlign: "left",
  },
  "& th": { bg: "surface.subtle", fontWeight: 600 },
  "& blockquote": {
    borderLeft: "3px solid",
    borderColor: "intent.primary",
    paddingLeft: "0.8em",
    margin: "0.5em 0",
    opacity: 0.85,
  },
  "& a": {
    color: "intent.primary",
    textDecoration: "underline",
    _hover: { opacity: 0.8 },
  },
  "& hr": {
    border: "none",
    borderTop: "1px solid",
    borderColor: "border.default",
    margin: "0.8em 0",
  },
};

const codeComponents = {
  code({
    className,
    children,
  }: {
    className?: string;
    children?: React.ReactNode;
  }) {
    const match = /language-(\w+)/.exec(className ?? "");
    const codeString = String(children).replace(/\n$/, "");

    if (match) {
      return (
        <SyntaxHighlighter
          style={oneDark}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: "8px", fontSize: "0.85em" }}
        >
          {codeString}
        </SyntaxHighlighter>
      );
    }

    return <code className={className}>{children}</code>;
  },
};

export const MessageContent = ({ content }: MessageContentProps) => {
  const { thinking, response } = parseThinkingContent(content);

  return (
    <Box className="message-content">
      {thinking !== null && (
        <Accordion.Root
          collapsible
          defaultValue={[]}
          mb={response ? 3 : 0}
          variant="plain"
        >
          <Accordion.Item value="thinking">
            <Accordion.ItemTrigger
              display="flex"
              alignItems="center"
              gap={1.5}
              cursor="pointer"
              color="text.secondary"
              fontSize="xs"
              fontStyle="italic"
              w="fit-content"
              _hover={{ color: "text.primary" }}
              transition="color 0.15s ease"
              py={1}
              bg="transparent"
              border="none"
              outline="none"
            >
              <Text>Thought through the problem</Text>
              <Accordion.ItemIndicator>
                <LuChevronDown size={12} />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Box
                borderLeft="2px solid"
                borderColor="border.default"
                pl={3}
                mt={1}
                mb={1}
                opacity={0.65}
                fontSize="xs"
                color="text.secondary"
                fontStyle="italic"
                css={markdownStyles}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={codeComponents}
                >
                  {thinking}
                </ReactMarkdown>
              </Box>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      )}

      {response && (
        <Box css={markdownStyles}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={codeComponents}
          >
            {response}
          </ReactMarkdown>
        </Box>
      )}
    </Box>
  );
};
