import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Box } from "@chakra-ui/react";

interface MessageContentProps {
  content: string;
}

export const MessageContent = ({ content }: MessageContentProps) => {
  return (
    <Box
      css={{
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
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className ?? "");
            const codeString = String(children).replace(/\n$/, "");

            if (match) {
              return (
                <SyntaxHighlighter
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: "8px",
                    fontSize: "0.85em",
                  }}
                >
                  {codeString}
                </SyntaxHighlighter>
              );
            }

            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
};
