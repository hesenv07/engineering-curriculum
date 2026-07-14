import * as React from 'react';
import {
  SandpackProvider,
  SandpackCodeEditor,
  SandpackPreview,
  SandpackLayout,
} from '@codesandbox/sandpack-react';

interface IFileEntry {
  code: string;
  filename: string;
  language: string;
}

interface ISandpackProps {
  children: React.ReactNode;
}

type TNodeProps = {
  className?: string;
  children?: React.ReactNode;
};

function getDefaultFilename(language: string, index: number): string {
  if (language === 'css') return '/src/styles.css';
  if (language === 'html') return '/public/index.html';
  if (index === 0) return '/App.js';
  return `/File${index}.js`;
}

function extractFilesFromChildren(children: React.ReactNode): IFileEntry[] {
  const files: IFileEntry[] = [];

  function findCode(node: React.ReactNode) {
    if (!React.isValidElement(node)) return;
    const props = node.props as TNodeProps;

    if (typeof props.className === 'string' && props.className.startsWith('language-')) {
      const language = props.className.replace('language-', '') || 'js';
      const code = String(props.children ?? '').trimEnd();
      if (code) {
        files.push({
          code,
          language,
          filename: getDefaultFilename(language, files.length),
        });
      }
      return;
    }

    if (props.children) {
      React.Children.forEach(props.children, findCode);
    }
  }

  React.Children.forEach(children, findCode);
  return files;
}

const Sandpack = ({ children }: ISandpackProps) => {
  const files = extractFilesFromChildren(children);

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-border dark:border-border-dark p-4 mb-6 bg-card dark:bg-card-dark text-sm text-secondary dark:text-secondary-dark">
        {children}
      </div>
    );
  }

  const sandpackFiles: Record<string, { code: string; active?: boolean }> = {};
  files.forEach((f, i) => {
    sandpackFiles[f.filename] = { code: f.code, active: i === 0 };
  });

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-border dark:border-border-dark shadow-sm">
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
};

export default Sandpack;
