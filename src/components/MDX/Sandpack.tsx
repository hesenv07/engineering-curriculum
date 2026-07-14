import * as React from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
} from '@codesandbox/sandpack-react';

interface FileEntry {
  code: string;
  filename: string;
  language: string;
}

function getDefaultFilename(language: string, index: number): string {
  if (language === 'css') return '/src/styles.css';
  if (language === 'html') return '/public/index.html';
  if (index === 0) return '/App.js';
  return `/File${index}.js`;
}

// Traverse React children tree to find code elements with language-* className
function extractFilesFromChildren(children: React.ReactNode): FileEntry[] {
  const files: FileEntry[] = [];

  function findCode(node: React.ReactNode) {
    if (!React.isValidElement(node)) return;
    const props = node.props as any;

    // Found a code element with language class (fenced code block)
    if (typeof props.className === 'string' && props.className.startsWith('language-')) {
      const language = props.className.replace('language-', '') || 'js';
      const code = String(props.children || '').trimEnd();
      if (code) {
        files.push({
          code,
          language,
          filename: getDefaultFilename(language, files.length),
        });
      }
      return;
    }

    // Traverse children
    if (props.children) {
      React.Children.forEach(props.children, findCode);
    }
  }

  React.Children.forEach(children, findCode);
  return files;
}

interface SandpackProps {
  children: React.ReactNode;
}

export function Sandpack({ children }: SandpackProps) {
  const files = extractFilesFromChildren(children);

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-[#EBECF0] dark:border-[#343A46] p-4 mb-6 bg-[#F9FBFC] dark:bg-[#2B3245] text-sm text-[#404756] dark:text-[#99A1B3]">
        {children}
      </div>
    );
  }

  const sandpackFiles: Record<string, { code: string; active?: boolean }> = {};
  files.forEach((f, i) => {
    sandpackFiles[f.filename] = { code: f.code, active: i === 0 };
  });

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-[#EBECF0] dark:border-[#343A46] shadow-sm">
      <SandpackProvider
        files={sandpackFiles}
        template="react"
        theme="light"
        options={{
          recompileMode: 'delayed',
          recompileDelay: 500,
        }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showTabs showLineNumbers />
          <SandpackPreview showNavigator={false} showOpenInCodeSandbox={false} />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}
