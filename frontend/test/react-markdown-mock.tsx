import React from "react";

// Test stub for the ESM-only react-markdown package. Renders the raw markdown
// string as text, which is enough for assertions in jsdom.
export default function ReactMarkdown({
  children,
}: {
  children?: React.ReactNode;
}) {
  return <div data-testid="markdown">{children}</div>;
}
