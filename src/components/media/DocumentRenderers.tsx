import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as fflate from 'fflate';
import {
  SpreadsheetEditor,
  SpreadsheetChartViewer,
  evaluateFormula,
  formatCellValue,
  colIndexToLetter,
  letterToColIndex,
  parseA1Coord,
  parseRange,
  parseCSV,
  parseXLSXBuffer,
  parseSpreadsheetBuffer,
  CellFormat,
  CellCoord,
  CellRange,
  ChartConfig,
  SpreadsheetSheet,
  SpreadsheetEditorProps,
} from '../document/SpreadsheetEditor';

// ============================================================================
// 1. High-Performance Lexical Syntax Highlighter & Editor for Heavy Code
// ============================================================================

export interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'function' | 'type' | 'operator' | 'punctuation' | 'plain' | 'variable';
  text: string;
}

const KEYWORDS_JS_TS = new Set([
  'abstract', 'any', 'as', 'async', 'await', 'boolean', 'break', 'case', 'catch', 'class',
  'const', 'constructor', 'continue', 'debugger', 'declare', 'default', 'delete', 'do',
  'else', 'enum', 'export', 'extends', 'false', 'finally', 'for', 'from', 'function',
  'get', 'if', 'implements', 'import', 'in', 'instanceof', 'interface', 'is', 'keyof',
  'let', 'module', 'namespace', 'never', 'new', 'null', 'number', 'object', 'of',
  'package', 'private', 'protected', 'public', 'readonly', 'require', 'return', 'set',
  'static', 'string', 'super', 'switch', 'symbol', 'this', 'throw', 'true', 'try',
  'type', 'typeof', 'undefined', 'unique', 'unknown', 'var', 'void', 'while', 'with', 'yield'
]);

const KEYWORDS_PYTHON = new Set([
  'and', 'as', 'assert', 'async', 'await', 'break', 'class', 'continue', 'def', 'del',
  'elif', 'else', 'except', 'False', 'finally', 'for', 'from', 'global', 'if', 'import',
  'in', 'is', 'lambda', 'None', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'True', 'try', 'while', 'with', 'yield', 'self', 'cls', 'match', 'case'
]);

const KEYWORDS_C_CPP_JAVA_RUST_GO = new Set([
  'auto', 'bool', 'break', 'case', 'catch', 'char', 'class', 'const', 'continue',
  'default', 'delete', 'do', 'double', 'else', 'enum', 'explicit', 'export', 'extern',
  'false', 'final', 'finally', 'float', 'fn', 'for', 'friend', 'func', 'goto', 'if',
  'import', 'inline', 'int', 'interface', 'let', 'long', 'match', 'mut', 'namespace',
  'new', 'null', 'nullptr', 'operator', 'package', 'private', 'protected', 'pub', 'public',
  'register', 'return', 'short', 'signed', 'sizeof', 'static', 'struct', 'switch',
  'template', 'this', 'throw', 'true', 'try', 'typedef', 'typename', 'type', 'union',
  'unsigned', 'using', 'var', 'virtual', 'void', 'volatile', 'while', 'impl', 'trait',
  'unsafe', 'where', 'loop', 'chan', 'defer', 'fallthrough', 'go', 'map', 'select'
]);

const KEYWORDS_SQL = new Set([
  'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set', 'delete',
  'create', 'table', 'drop', 'alter', 'index', 'primary', 'key', 'foreign', 'references',
  'join', 'inner', 'left', 'right', 'outer', 'full', 'cross', 'on', 'group', 'by',
  'having', 'order', 'asc', 'desc', 'limit', 'offset', 'union', 'all', 'distinct',
  'as', 'and', 'or', 'not', 'in', 'is', 'null', 'like', 'between', 'exists', 'case',
  'when', 'then', 'else', 'end', 'cast', 'count', 'sum', 'avg', 'min', 'max',
  'view', 'trigger', 'procedure', 'cursor', 'database', 'grant', 'revoke'
]);

const KEYWORDS_PHP = new Set([
  'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class',
  'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else',
  'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch',
  'endwhile', 'eval', 'exit', 'extends', 'false', 'final', 'finally', 'fn', 'for',
  'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once',
  'instanceof', 'insteadof', 'interface', 'isset', 'list', 'match', 'namespace',
  'new', 'null', 'or', 'print', 'private', 'protected', 'public', 'readonly', 'require',
  'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'true', 'try',
  'unset', 'use', 'var', 'while', 'xor', 'yield'
]);

const KEYWORDS_RUBY = new Set([
  'alias', 'and', 'begin', 'break', 'case', 'class', 'def', 'defined', 'do',
  'else', 'elsif', 'end', 'ensure', 'false', 'for', 'if', 'in', 'module',
  'next', 'nil', 'not', 'or', 'redo', 'rescue', 'retry', 'return', 'self',
  'super', 'then', 'true', 'undef', 'unless', 'until', 'when', 'while', 'yield',
  'require', 'include', 'extend', 'attr_accessor', 'attr_reader', 'attr_writer',
  'puts', 'print'
]);

const KEYWORDS_KOTLIN = new Set([
  'abstract', 'actual', 'annotation', 'as', 'break', 'by', 'catch', 'class',
  'companion', 'const', 'constructor', 'continue', 'crossinline', 'data',
  'delegate', 'do', 'dynamic', 'else', 'enum', 'expect', 'external', 'false',
  'final', 'finally', 'for', 'fun', 'get', 'if', 'import', 'in', 'infix',
  'init', 'inline', 'inner', 'interface', 'internal', 'is', 'lateinit', 'noinline',
  'null', 'object', 'open', 'operator', 'out', 'override', 'package', 'private',
  'protected', 'public', 'reified', 'return', 'sealed', 'set', 'super', 'suspend',
  'tailrec', 'this', 'throw', 'true', 'try', 'typealias', 'typeof', 'val', 'var',
  'vararg', 'when', 'where', 'while'
]);

const KEYWORDS_SWIFT = new Set([
  'actor', 'associatedtype', 'async', 'await', 'break', 'case', 'catch', 'class',
  'continue', 'convenience', 'default', 'defer', 'deinit', 'dynamic', 'else',
  'enum', 'extension', 'fallthrough', 'false', 'fileprivate', 'final', 'for',
  'func', 'get', 'guard', 'if', 'import', 'in', 'indirect', 'infix', 'init',
  'inout', 'internal', 'is', 'lazy', 'let', 'mutating', 'nil', 'nonmutating',
  'open', 'operator', 'optional', 'override', 'postfix', 'precedencegroup',
  'prefix', 'private', 'protocol', 'public', 'repeat', 'required', 'rethrows',
  'return', 'self', 'Self', 'set', 'some', 'static', 'struct', 'subscript',
  'super', 'switch', 'throw', 'throws', 'true', 'try', 'typealias', 'unowned',
  'var', 'weak', 'where', 'while', 'willSet', 'didSet'
]);

const KEYWORDS_SHELL = new Set([
  'alias', 'bg', 'bind', 'break', 'builtin', 'case', 'cd', 'command', 'compgen',
  'complete', 'continue', 'declare', 'dirs', 'disown', 'do', 'done', 'echo',
  'elif', 'else', 'enable', 'esac', 'eval', 'exec', 'exit', 'export', 'false',
  'fc', 'fg', 'fi', 'for', 'function', 'getopts', 'hash', 'help', 'history',
  'if', 'in', 'jobs', 'kill', 'let', 'local', 'logout', 'popd', 'printf', 'pushd',
  'pwd', 'read', 'readonly', 'return', 'set', 'shift', 'shopt', 'source', 'suspend',
  'test', 'then', 'time', 'times', 'trap', 'true', 'type', 'typeset', 'ulimit',
  'umask', 'unalias', 'unset', 'until', 'wait', 'while', 'param', 'process', 'workflow'
]);

const KEYWORDS_DOCKER_TOML = new Set([
  'from', 'run', 'cmd', 'label', 'expose', 'env', 'add', 'copy', 'entrypoint',
  'volume', 'user', 'workdir', 'arg', 'onbuild', 'stopsignal', 'healthcheck',
  'shell', 'maintainer', 'true', 'false'
]);

export function detectLanguageFromExt(extOrName: string): string {
  const clean = (extOrName || '').toLowerCase().trim();
  const ext = clean.includes('.') ? clean.split('.').pop() || '' : clean;

  switch (ext) {
    case 'js':
    case 'mjs':
    case 'cjs':
      return 'javascript';
    case 'ts':
    case 'mts':
    case 'cts':
      return 'typescript';
    case 'jsx':
      return 'jsx';
    case 'tsx':
      return 'tsx';
    case 'py':
    case 'pyw':
    case 'ipynb':
      return 'python';
    case 'c':
    case 'h':
      return 'c';
    case 'cpp':
    case 'cc':
    case 'cxx':
    case 'hpp':
    case 'hh':
      return 'cpp';
    case 'java':
      return 'java';
    case 'rs':
      return 'rust';
    case 'go':
      return 'go';
    case 'html':
    case 'htm':
    case 'svg':
      return 'html';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css';
    case 'sql':
      return 'sql';
    case 'json':
    case 'json5':
    case 'jsonc':
      return 'json';
    case 'xml':
    case 'xaml':
      return 'xml';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'sh':
    case 'bash':
    case 'zsh':
    case 'ps1':
    case 'psm1':
    case 'bat':
    case 'cmd':
      return 'shell';
    case 'md':
    case 'markdown':
      return 'markdown';
    case 'php':
    case 'phtml':
    case 'php3':
    case 'php4':
    case 'php5':
      return 'php';
    case 'rb':
    case 'ruby':
    case 'rake':
    case 'gemspec':
      return 'ruby';
    case 'kt':
    case 'kts':
      return 'kotlin';
    case 'swift':
      return 'swift';
    case 'dockerfile':
    case 'docker':
      return 'dockerfile';
    case 'toml':
      return 'toml';
    default:
      return 'plaintext';
  }
}

/**
 * Super fast, linear lexical tokenizer for instant syntax highlighting of heavy files across all languages.
 */
export function tokenizeLine(line: string, lang: string): Token[] {
  if (!line) return [{ type: 'plain', text: '' }];

  const tokens: Token[] = [];
  let i = 0;
  const len = line.length;

  const isAlpha = (ch: string) => /[a-zA-Z_]/.test(ch);
  const isAlphaNum = (ch: string) => /[a-zA-Z0-9_]/.test(ch);
  const isDigit = (ch: string) => /[0-9]/.test(ch);

  while (i < len) {
    const ch = line[i];

    // Single line comments
    if (
      (ch === '/' && line[i + 1] === '/') ||
      (ch === '#' && lang !== 'css') ||
      (ch === '-' && line[i + 1] === '-' && lang === 'sql') ||
      (ch === ';' && (lang === 'toml' || lang === 'ini'))
    ) {
      tokens.push({ type: 'comment', text: line.slice(i) });
      break;
    }

    // PHP / Bash / PowerShell Variables ($foo, ${foo})
    if (ch === '$' && (lang === 'php' || lang === 'shell' || lang === 'bash' || isAlpha(line[i + 1] || ''))) {
      let start = i;
      i++;
      if (line[i] === '{') {
        while (i < len && line[i] !== '}') i++;
        if (i < len) i++;
      } else {
        while (i < len && isAlphaNum(line[i])) i++;
      }
      tokens.push({ type: 'variable', text: line.slice(start, i) });
      continue;
    }

    // Strings (single/double quotes or backticks)
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      let start = i;
      i++;
      while (i < len && line[i] !== quote) {
        if (line[i] === '\\' && i + 1 < len) {
          i += 2;
        } else {
          i++;
        }
      }
      if (i < len) i++; // Include closing quote
      tokens.push({ type: 'string', text: line.slice(start, i) });
      continue;
    }

    // Numbers (hex, float, binary, integer)
    if (isDigit(ch) || (ch === '.' && isDigit(line[i + 1] || ''))) {
      let start = i;
      while (i < len && /[0-9a-fA-FxXoObB_.]/.test(line[i])) {
        i++;
      }
      tokens.push({ type: 'number', text: line.slice(start, i) });
      continue;
    }

    // Words (keywords, types, functions, identifiers)
    if (isAlpha(ch)) {
      let start = i;
      while (i < len && isAlphaNum(line[i])) {
        i++;
      }
      const word = line.slice(start, i);
      const lowerWord = word.toLowerCase();

      // Check next non-whitespace char for function call
      let j = i;
      while (j < len && /\s/.test(line[j])) j++;
      const isFnCall = j < len && line[j] === '(';

      if (
        KEYWORDS_JS_TS.has(word) ||
        KEYWORDS_PYTHON.has(word) ||
        KEYWORDS_C_CPP_JAVA_RUST_GO.has(word) ||
        KEYWORDS_PHP.has(lowerWord) ||
        KEYWORDS_RUBY.has(word) ||
        KEYWORDS_KOTLIN.has(word) ||
        KEYWORDS_SWIFT.has(word) ||
        KEYWORDS_SHELL.has(lowerWord) ||
        KEYWORDS_DOCKER_TOML.has(lowerWord) ||
        KEYWORDS_SQL.has(lowerWord)
      ) {
        tokens.push({ type: 'keyword', text: word });
      } else if (isFnCall) {
        tokens.push({ type: 'function', text: word });
      } else if (/^[A-Z][a-zA-Z0-9_$]*$/.test(word)) {
        tokens.push({ type: 'type', text: word });
      } else {
        tokens.push({ type: 'plain', text: word });
      }
      continue;
    }

    // Operators & Punctuation
    if (/[+\-*/%=<>!&|^~?:;.,(){}[\]@]/.test(ch)) {
      tokens.push({
        type: /[+\-*/%=<>!&|^~?]/.test(ch) ? 'operator' : 'punctuation',
        text: ch,
      });
      i++;
      continue;
    }

    // Spaces and other characters
    let start = i;
    while (i < len && /\s/.test(line[i])) {
      i++;
    }
    if (i > start) {
      tokens.push({ type: 'plain', text: line.slice(start, i) });
    } else {
      tokens.push({ type: 'plain', text: ch });
      i++;
    }
  }

  return tokens;
}

// ============================================================================
// Heavy Code Viewer & Inline Code Editor with Virtualized Rendering & Save
// ============================================================================

export interface HeavyCodeViewerProps {
  code: string;
  filename?: string;
  language?: string;
  fileUrl?: string;
  maxHeight?: number | string;
  collapsible?: boolean;
  editable?: boolean;
  readOnly?: boolean;
  onCodeChange?: (newCode: string) => void;
  className?: string;
  containerClassName?: string;
}

export const HeavyCodeViewer: React.FC<HeavyCodeViewerProps> = ({
  code: propCode,
  filename = 'code.ts',
  language,
  fileUrl: _fileUrl,
  maxHeight = 460,
  collapsible = true,
  editable = true,
  readOnly = false,
  onCodeChange,
  className = '',
  containerClassName = '',
}) => {
  const [currentCode, setCurrentCode] = useState<string>(propCode || '');
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (propCode !== undefined) {
      setCurrentCode(propCode);
    }
  }, [propCode]);

  const lang = useMemo(() => language || detectLanguageFromExt(filename), [language, filename]);
  const lines = useMemo(() => (currentCode || '').split(/\r?\n/), [currentCode]);
  const totalLines = lines.length;

  // Windowing / Chunk rendering for heavy code (50k+ lines)
  const [visibleChunk, setVisibleChunk] = useState(500);

  const displayedLines = useMemo(() => {
    if (isExpanded || totalLines <= visibleChunk) {
      return lines;
    }
    return lines.slice(0, visibleChunk);
  }, [lines, isExpanded, totalLines, visibleChunk]);

  // Track cursor position in textarea
  const updateCursorPosition = useCallback(() => {
    if (!textareaRef.current) return;
    const pos = textareaRef.current.selectionStart || 0;
    const textBefore = currentCode.slice(0, pos);
    const splitLines = textBefore.split('\n');
    const line = splitLines.length;
    const col = (splitLines[splitLines.length - 1]?.length || 0) + 1;
    setCursorPos({ line, col });
  }, [currentCode]);

  // Tab key & Auto-indent interception
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      if (e.shiftKey) {
        // Dedent: remove up to 2 leading spaces from line
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const lineEnd = val.indexOf('\n', end);
        const effectiveEnd = lineEnd === -1 ? val.length : lineEnd;
        const selectedBlock = val.slice(lineStart, effectiveEnd);
        const dedented = selectedBlock
          .split('\n')
          .map((l) => (l.startsWith('  ') ? l.slice(2) : l.startsWith(' ') ? l.slice(1) : l))
          .join('\n');

        const nextVal = val.slice(0, lineStart) + dedented + val.slice(effectiveEnd);
        setCurrentCode(nextVal);
        setTimeout(() => {
          textarea.selectionStart = Math.max(0, start - 2);
          textarea.selectionEnd = Math.max(0, end - (selectedBlock.length - dedented.length));
          updateCursorPosition();
        }, 0);
      } else {
        if (start === end) {
          // Insert 2 spaces at cursor
          const nextVal = val.slice(0, start) + '  ' + val.slice(end);
          setCurrentCode(nextVal);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + 2;
            updateCursorPosition();
          }, 0);
        } else {
          // Indent all selected lines by 2 spaces
          const lineStart = val.lastIndexOf('\n', start - 1) + 1;
          const lineEnd = val.indexOf('\n', end);
          const effectiveEnd = lineEnd === -1 ? val.length : lineEnd;
          const selectedBlock = val.slice(lineStart, effectiveEnd);
          const indented = selectedBlock
            .split('\n')
            .map((l) => '  ' + l)
            .join('\n');

          const nextVal = val.slice(0, lineStart) + indented + val.slice(effectiveEnd);
          setCurrentCode(nextVal);
          setTimeout(() => {
            textarea.selectionStart = start + 2;
            textarea.selectionEnd = end + (indented.length - selectedBlock.length);
            updateCursorPosition();
          }, 0);
        }
      }
    } else if (e.key === 'Enter') {
      // Auto-indent
      const start = textarea.selectionStart;
      const val = textarea.value;
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const currentLineText = val.slice(lineStart, start);
      const indentMatch = currentLineText.match(/^(\s*)/);
      let indent = indentMatch ? indentMatch[1] : '';

      // Add extra indent if previous line ends with opening bracket or colon
      const trimmedLine = currentLineText.trimEnd();
      if (/[{[(:]$/.test(trimmedLine)) {
        indent += '  ';
      }

      e.preventDefault();
      const nextVal = val.slice(0, start) + '\n' + indent + val.slice(start);
      setCurrentCode(nextVal);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
        updateCursorPosition();
      }, 0);
    }
  };

  // Sync scroll between textarea and gutter in edit mode
  const handleTextareaScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleSave = useCallback(() => {
    onCodeChange?.(currentCode);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);

    // Sync to parent DOM if inside notebook page slot
    if (textareaRef.current) {
      const container = textareaRef.current.closest('.nb-code-container');
      if (container) {
        container.setAttribute('data-code', currentCode);
        const editableParent = container.closest('.page.current, [contenteditable="true"]');
        if (editableParent) {
          editableParent.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }
  }, [currentCode, onCodeChange]);

  const handleReplaceOne = useCallback(() => {
    if (!searchQuery) return;
    const idx = currentCode.indexOf(searchQuery);
    if (idx !== -1) {
      const next = currentCode.slice(0, idx) + replaceQuery + currentCode.slice(idx + searchQuery.length);
      setCurrentCode(next);
    }
  }, [currentCode, searchQuery, replaceQuery]);

  const handleReplaceAll = useCallback(() => {
    if (!searchQuery) return;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const next = currentCode.replace(regex, replaceQuery);
    setCurrentCode(next);
  }, [currentCode, searchQuery, replaceQuery]);

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [currentCode]);

  const handleDownload = useCallback(() => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'code.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, [currentCode, filename]);

  return (
    <div
      className={`nb-document-viewer nb-code-container ${containerClassName}`}
      data-filename={filename}
      data-lang={lang}
      data-code={currentCode}
      contentEditable={false}
    >
      {/* Code Header Bar */}
      <div className="nb-code-header">
        <div className="nb-code-title">
          <span className="nb-code-icon">💻</span>
          <span className="nb-code-filename" title={filename}>{filename}</span>
          <span className="nb-code-lang-badge">{lang.toUpperCase()}</span>
          <span className="nb-code-lines-badge">{totalLines.toLocaleString()} lines</span>
          {saveStatus === 'saved' && <span className="nb-word-saved-tag">✓ Saved</span>}
        </div>

        <div className="nb-code-actions">
          <button
            type="button"
            className={`nb-code-btn ${showSearch ? 'nb-code-btn--active' : ''}`}
            onClick={() => setShowSearch((p) => !p)}
            title="Search and Replace in Code"
          >
            🔍
          </button>
          {editable && !readOnly && (
            <button
              type="button"
              className={`nb-code-btn ${isEditing ? 'nb-code-btn--active' : ''}`}
              onClick={() => setIsEditing((p) => !p)}
              title={isEditing ? 'View Mode' : 'Edit Code'}
            >
              {isEditing ? '👁️ View' : '✏️ Edit'}
            </button>
          )}
          {isEditing && !readOnly && (
            <button
              type="button"
              className="nb-code-btn nb-code-btn--primary"
              onClick={handleSave}
              title="Save Code to Notebook"
            >
              💾 Save
            </button>
          )}
          <button
            type="button"
            className="nb-code-btn"
            onClick={handleCopy}
            title={copied ? 'Copied to clipboard!' : 'Copy entire code'}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
          <button
            type="button"
            className="nb-code-btn"
            onClick={handleDownload}
            title="Download source file"
          >
            ⬇️
          </button>
          {collapsible && totalLines > 20 && (
            <button
              type="button"
              className="nb-code-btn"
              onClick={() => setIsExpanded((p) => !p)}
              title={isExpanded ? 'Collapse viewer' : 'Expand full height'}
            >
              {isExpanded ? '⤡ Collapse' : '⤢ Expand'}
            </button>
          )}
        </div>
      </div>

      {/* Search & Replace Bar */}
      {showSearch && (
        <div className="nb-code-search-bar">
          <div className="nb-code-search-row">
            <input
              type="text"
              className="nb-code-search-input"
              placeholder="Find in code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                className="nb-code-search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
            <button
              type="button"
              className="nb-code-search-btn"
              onClick={() => setShowReplace((p) => !p)}
              title="Toggle Replace"
            >
              🔁 Replace
            </button>
          </div>

          {showReplace && (
            <div className="nb-code-replace-row">
              <input
                type="text"
                className="nb-code-search-input"
                placeholder="Replace with..."
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
              />
              <button
                type="button"
                className="nb-code-search-btn"
                onClick={handleReplaceOne}
                title="Replace first occurrence"
              >
                Replace
              </button>
              <button
                type="button"
                className="nb-code-search-btn"
                onClick={handleReplaceAll}
                title="Replace all occurrences"
              >
                Replace All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Code Body & Editor */}
      <div
        className={`nb-code-body ${className}`}
        style={isExpanded ? { maxHeight: 'none' } : (maxHeight !== 460 ? { maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight } : undefined)}
      >
        {isEditing ? (
          <div className="nb-code-edit-container">
            <div ref={gutterRef} className="nb-code-edit-gutter" aria-hidden="true">
              {lines.map((_, idx) => (
                <div key={idx} className="nb-code-edit-gutter-line">
                  {idx + 1}
                </div>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              className="nb-code-textarea"
              value={currentCode}
              onChange={(e) => {
                setCurrentCode(e.target.value);
                updateCursorPosition();
              }}
              onKeyDown={handleTextareaKeyDown}
              onSelect={updateCursorPosition}
              onClick={updateCursorPosition}
              onKeyUp={updateCursorPosition}
              onScroll={handleTextareaScroll}
              spellCheck={false}
              wrap="off"
              placeholder="Type or paste code here..."
            />
          </div>
        ) : (
          <div className="nb-code-scroll-content">
            <table className="nb-code-table">
              <tbody>
                {displayedLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const matchesSearch = searchQuery && line.toLowerCase().includes(searchQuery.toLowerCase());
                  const tokens = tokenizeLine(line, lang);

                  return (
                    <tr
                      key={lineNum}
                      className={`nb-code-line ${matchesSearch ? 'nb-code-line--matched' : ''}`}
                    >
                      <td className="nb-code-gutter" data-line-num={lineNum}>
                        {lineNum}
                      </td>
                      <td className="nb-code-content">
                        {tokens.map((tok, tIdx) => (
                          <span key={tIdx} className={`tok-${tok.type}`}>
                            {tok.text}
                          </span>
                        ))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!isExpanded && totalLines > visibleChunk && (
              <div className="nb-code-load-more">
                <button
                  type="button"
                  className="nb-code-btn nb-code-btn--more"
                  onClick={() => setVisibleChunk((prev) => prev + 1000)}
                >
                  Load Next 1,000 Lines ({totalLines - visibleChunk} remaining)...
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      {isEditing && (
        <div className="nb-code-status-bar">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span>Tab: 2 spaces</span>
          <span>{lang.toUpperCase()}</span>
          <span>UTF-8</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 2. Excel & CSV Spreadsheet Viewer
// ============================================================================

export { parseCSV, parseXLSXBuffer, parseSpreadsheetBuffer };
export type { SpreadsheetSheet };

export interface SpreadsheetViewerProps extends Omit<SpreadsheetEditorProps, 'data'> {
  data?: SpreadsheetSheet[] | string[][] | string;
}

export const SpreadsheetViewer: React.FC<SpreadsheetViewerProps> = (props) => {
  if (typeof props.data === 'string') {
    return <SpreadsheetEditor {...props} data={undefined} initialCsv={props.data} />;
  }
  return <SpreadsheetEditor {...props} data={props.data as any} />;
};

export {
  SpreadsheetEditor,
  SpreadsheetChartViewer,
  evaluateFormula,
  formatCellValue,
  colIndexToLetter,
  letterToColIndex,
  parseA1Coord,
  parseRange,
};
export type {
  CellFormat,
  CellCoord,
  CellRange,
  ChartConfig,
  SpreadsheetEditorProps,
};


// ============================================================================
// 3. Word Document Viewer (.docx / .doc)
// ============================================================================

export interface WordDocRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
}

export interface WordDocParagraph {
  id?: string;
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'bullet' | 'numbered' | 'table';
  text?: string;
  html?: string;
  runs?: WordDocRun[];
  tableData?: string[][];
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unescapeXml(str: string): string {
  return (str || '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

export function parseDocxBuffer(buffer: Uint8Array): WordDocParagraph[] {
  try {
    const unzipped = fflate.unzipSync(buffer);
    const docXmlFile = unzipped['word/document.xml'];
    if (!docXmlFile) {
      return [{ id: 'p_0', type: 'p', text: 'No document.xml found inside docx archive.' }];
    }

    const decoder = new TextDecoder('utf-8');
    const docXml = decoder.decode(docXmlFile);
    const paragraphs: WordDocParagraph[] = [];

    const blocks = docXml.match(/<w:tbl[\s\S]*?<\/w:tbl>|<w:p[\s\S]*?<\/w:p>/g) || [];
    let pCounter = 0;

    for (const block of blocks) {
      pCounter++;
      const id = `p_${pCounter}_${Math.random().toString(36).slice(2, 7)}`;
      if (block.startsWith('<w:tbl')) {
        const rows: string[][] = [];
        const trMatches = block.match(/<w:tr[\s\S]*?<\/w:tr>/g) || [];
        for (const tr of trMatches) {
          const cells: string[] = [];
          const tcMatches = tr.match(/<w:tc[\s\S]*?<\/w:tc>/g) || [];
          for (const tc of tcMatches) {
            const tMatches = tc.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
            const text = unescapeXml(tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join(' '));
            cells.push(text.trim());
          }
          if (cells.length > 0) rows.push(cells);
        }
        if (rows.length > 0) {
          paragraphs.push({ id, type: 'table', tableData: rows });
        }
      } else {
        const styleMatch = block.match(/<w:pStyle\s+w:val="([^"]+)"/i);
        const styleVal = styleMatch ? styleMatch[1].toLowerCase() : '';

        let type: WordDocParagraph['type'] = 'p';
        if (styleVal.includes('heading1') || styleVal === 'heading 1' || styleVal === 'title') {
          type = 'h1';
        } else if (styleVal.includes('heading2') || styleVal === 'heading 2' || styleVal === 'subtitle') {
          type = 'h2';
        } else if (styleVal.includes('heading3') || styleVal === 'heading 3') {
          type = 'h3';
        } else if (styleVal.includes('heading4') || styleVal === 'heading 4') {
          type = 'h4';
        } else if (styleVal.includes('heading5') || styleVal === 'heading 5') {
          type = 'h5';
        } else if (styleVal.includes('heading6') || styleVal === 'heading 6') {
          type = 'h6';
        } else if (block.includes('<w:numPr')) {
          if (block.includes('w:numId w:val="2"') || styleVal.includes('number') || styleVal.includes('ordered')) {
            type = 'numbered';
          } else {
            type = 'bullet';
          }
        }

        const jcMatch = block.match(/<w:jc\s+w:val="([^"]+)"/i);
        let align: WordDocParagraph['align'] = 'left';
        if (jcMatch) {
          const val = jcMatch[1].toLowerCase();
          if (val === 'center') align = 'center';
          else if (val === 'right') align = 'right';
          else if (val === 'both' || val === 'justify') align = 'justify';
        }

        const tMatches = block.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
        const text = unescapeXml(tMatches.map((t) => t.replace(/<[^>]+>/g, '')).join(''));

        const bold = block.includes('<w:b/>') || block.includes('<w:b ') || block.includes('w:b w:val="1"') || block.includes('w:b w:val="true"');
        const italic = block.includes('<w:i/>') || block.includes('<w:i ') || block.includes('w:i w:val="1"') || block.includes('w:i w:val="true"');
        const underline = block.includes('<w:u ') || block.includes('<w:u/>');
        const strike = block.includes('<w:strike/>') || block.includes('<w:dstrike/>');

        if (text.trim() || type.startsWith('h')) {
          paragraphs.push({
            id,
            type,
            text,
            bold,
            italic,
            underline,
            strike,
            align,
          });
        }
      }
    }

    return paragraphs.length > 0 ? paragraphs : [{ id: 'p_0', type: 'p', text: 'Document is empty.' }];
  } catch (err: any) {
    return [{ id: 'p_err', type: 'p', text: `Could not parse Word document: ${err.message}` }];
  }
}

export function generateDocxBuffer(paragraphs: WordDocParagraph[]): Uint8Array {
  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const docRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

  let docBodyXml = '';
  for (const p of paragraphs) {
    if (p.type === 'table' && p.tableData) {
      let tblRowsXml = '';
      for (const row of p.tableData) {
        let cellsXml = '';
        for (const cell of row) {
          cellsXml += `<w:tc><w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr><w:p><w:r><w:t>${escapeXml(cell)}</w:t></w:r></w:p></w:tc>`;
        }
        tblRowsXml += `<w:tr>${cellsXml}</w:tr>`;
      }
      docBodyXml += `<w:tbl><w:tblPr><w:tblBorders><w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/></w:tblBorders></w:tblPr>${tblRowsXml}</w:tbl>`;
    } else {
      let pPr = '';
      let pStyle = '';
      if (p.type === 'h1') pStyle = '<w:pStyle w:val="Heading1"/>';
      else if (p.type === 'h2') pStyle = '<w:pStyle w:val="Heading2"/>';
      else if (p.type === 'h3') pStyle = '<w:pStyle w:val="Heading3"/>';
      else if (p.type === 'h4') pStyle = '<w:pStyle w:val="Heading4"/>';
      else if (p.type === 'h5') pStyle = '<w:pStyle w:val="Heading5"/>';
      else if (p.type === 'h6') pStyle = '<w:pStyle w:val="Heading6"/>';
      else if (p.type === 'bullet') pStyle = '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>';
      else if (p.type === 'numbered') pStyle = '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="2"/></w:numPr>';

      let jc = '';
      if (p.align && p.align !== 'left') {
        const val = p.align === 'justify' ? 'both' : p.align;
        jc = `<w:jc w:val="${val}"/>`;
      }
      if (pStyle || jc) {
        pPr = `<w:pPr>${pStyle}${jc}</w:pPr>`;
      }

      let rPr = '';
      const isBold = p.bold || p.type === 'h1' || p.type === 'h2';
      if (isBold || p.italic || p.underline || p.strike) {
        rPr = `<w:rPr>${isBold ? '<w:b/>' : ''}${p.italic ? '<w:i/>' : ''}${p.underline ? '<w:u w:val="single"/>' : ''}${p.strike ? '<w:strike/>' : ''}</w:rPr>`;
      }

      const text = p.text || '';
      docBodyXml += `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${escapeXml(text)}</w:t></w:r></w:p>`;
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${docBodyXml}
    <w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`;

  const files: Record<string, Uint8Array> = {
    '[Content_Types].xml': fflate.strToU8(contentTypesXml),
    '_rels/.rels': fflate.strToU8(rootRelsXml),
    'word/_rels/document.xml.rels': fflate.strToU8(docRelsXml),
    'word/document.xml': fflate.strToU8(documentXml),
  };

  return fflate.zipSync(files);
}

export interface WordDocumentViewerProps {
  paragraphs?: WordDocParagraph[];
  fileUrl?: string;
  filename?: string;
  className?: string;
  containerClassName?: string;
  onSave?: (paragraphs: WordDocParagraph[]) => void;
  onContentChange?: (paragraphs: WordDocParagraph[]) => void;
  readOnly?: boolean;
}

export const WordDocumentViewer: React.FC<WordDocumentViewerProps> = ({
  paragraphs: propParagraphs,
  fileUrl,
  filename = 'document.docx',
  className = '',
  containerClassName = '',
  onSave,
  onContentChange,
  readOnly = false,
}) => {
  const [paragraphs, setParagraphs] = useState<WordDocParagraph[]>(() => {
    if (propParagraphs && propParagraphs.length > 0) return propParagraphs;
    return [{ id: 'p_init_1', type: 'h1', text: 'Document Title' }, { id: 'p_init_2', type: 'p', text: 'Start writing your document here...' }];
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeParaIdx, setActiveParaIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (propParagraphs && propParagraphs.length > 0) {
      setParagraphs(propParagraphs);
      return;
    }
    if (fileUrl) {
      setLoading(true);
      fetch(fileUrl)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          const parsed = parseDocxBuffer(new Uint8Array(buf));
          setParagraphs(parsed);
        })
        .catch((err) => {
          setParagraphs([{ id: 'p_err', type: 'p', text: `Failed to load document: ${err.message}` }]);
        })
        .finally(() => setLoading(false));
    }
  }, [propParagraphs, fileUrl]);

  const wordStats = useMemo(() => {
    let words = 0;
    let chars = 0;
    for (const p of paragraphs) {
      if (p.text) {
        chars += p.text.length;
        const ws = p.text.trim().split(/\s+/).filter(Boolean);
        words += ws.length;
      } else if (p.tableData) {
        for (const row of p.tableData) {
          for (const cell of row) {
            chars += cell.length;
            words += cell.trim().split(/\s+/).filter(Boolean).length;
          }
        }
      }
    }
    return { words, chars, count: paragraphs.length };
  }, [paragraphs]);

  const updateParagraph = useCallback((index: number, updates: Partial<WordDocParagraph>) => {
    setParagraphs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      onContentChange?.(next);
      return next;
    });
  }, [onContentChange]);

  const addParagraph = (type: WordDocParagraph['type'] = 'p', afterIdx?: number) => {
    const newPara: WordDocParagraph = {
      id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      text: type === 'h1' ? 'New Heading' : type === 'h2' ? 'Subheading' : '',
    };
    setParagraphs((prev) => {
      const next = [...prev];
      const insertAt = afterIdx !== undefined ? afterIdx + 1 : next.length;
      next.splice(insertAt, 0, newPara);
      onContentChange?.(next);
      return next;
    });
    if (afterIdx !== undefined) {
      setActiveParaIdx(afterIdx + 1);
    }
  };

  const addTable = (afterIdx?: number) => {
    const newPara: WordDocParagraph = {
      id: `tbl_${Date.now()}`,
      type: 'table',
      tableData: [
        ['Header 1', 'Header 2', 'Header 3'],
        ['Item A', 'Item B', 'Item C'],
        ['Item X', 'Item Y', 'Item Z'],
      ],
    };
    setParagraphs((prev) => {
      const next = [...prev];
      const insertAt = afterIdx !== undefined ? afterIdx + 1 : next.length;
      next.splice(insertAt, 0, newPara);
      onContentChange?.(next);
      return next;
    });
  };

  const deleteParagraph = (index: number) => {
    setParagraphs((prev) => {
      if (prev.length <= 1) {
        return [{ id: `p_${Date.now()}`, type: 'p', text: '' }];
      }
      const next = prev.filter((_, i) => i !== index);
      onContentChange?.(next);
      return next;
    });
    if (activeParaIdx === index) {
      setActiveParaIdx(null);
    }
  };

  const moveParagraph = (index: number, direction: 'up' | 'down') => {
    setParagraphs((prev) => {
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      onContentChange?.(next);
      return next;
    });
    setActiveParaIdx((prev) => (prev === index ? (direction === 'up' ? index - 1 : index + 1) : prev));
  };

  const handleExportDocx = () => {
    const buffer = generateDocxBuffer(paragraphs);
    const blob = new Blob([buffer as any], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.docx') ? filename : `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSave?.(paragraphs);
    onContentChange?.(paragraphs);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const activePara = activeParaIdx !== null ? paragraphs[activeParaIdx] : null;

  return (
    <div
      className={`nb-document-viewer nb-word-container ${containerClassName}`}
      data-filename={filename}
      contentEditable={false}
    >
      {/* Header Bar */}
      <div className="nb-word-header">
        <div className="nb-word-title">
          <span className="nb-doc-icon">📝</span>
          <span className="nb-doc-filename" title={filename}>{filename}</span>
          <span className="nb-word-count-badge">
            {wordStats.words.toLocaleString()} words • {wordStats.count} blocks
          </span>
          {saveStatus === 'saved' && <span className="nb-word-saved-tag">✓ Saved</span>}
        </div>

        <div className="nb-word-actions">
          {!readOnly && (
            <button
              type="button"
              className={`nb-code-btn ${isEditing ? 'nb-code-btn--active' : ''}`}
              onClick={() => setIsEditing((p) => !p)}
              title={isEditing ? 'Exit Edit Mode' : 'Enter Inline Edit Mode'}
            >
              {isEditing ? '👁️ Preview' : '✏️ Edit'}
            </button>
          )}
          {!readOnly && (
            <button
              type="button"
              className="nb-code-btn"
              onClick={handleSave}
              title="Save document changes"
            >
              💾 Save
            </button>
          )}
          <button
            type="button"
            className="nb-code-btn"
            onClick={handleExportDocx}
            title="Generate & Download valid DOCX file"
          >
            ⬇️ Export .docx
          </button>
          {fileUrl && (
            <a
              href={fileUrl}
              download={filename}
              className="nb-code-btn"
              title="Download Original File"
            >
              ⬇️
            </a>
          )}
        </div>
      </div>

      {/* Rich Formatting Toolbar (Visible in Edit Mode) */}
      {isEditing && !readOnly && (
        <div className="nb-word-toolbar">
          <div className="nb-word-toolbar-group">
            <label className="nb-word-toolbar-label">Style:</label>
            <select
              className="nb-word-style-select"
              value={activePara?.type || 'p'}
              onChange={(e) => {
                if (activeParaIdx !== null) {
                  updateParagraph(activeParaIdx, { type: e.target.value as WordDocParagraph['type'] });
                }
              }}
              title="Paragraph Style / Heading Level"
            >
              <option value="p">Normal Text</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
              <option value="h4">Heading 4</option>
              <option value="h5">Heading 5</option>
              <option value="h6">Heading 6</option>
              <option value="bullet">• Bullet List</option>
              <option value="numbered">1. Numbered List</option>
            </select>
          </div>

          <div className="nb-word-toolbar-divider" />

          {/* Formatting Toggles */}
          <div className="nb-word-toolbar-group">
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.bold ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { bold: !activePara?.bold })}
              title="Bold"
            >
              <b>B</b>
            </button>
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.italic ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { italic: !activePara?.italic })}
              title="Italic"
            >
              <i>I</i>
            </button>
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.underline ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { underline: !activePara?.underline })}
              title="Underline"
            >
              <u>U</u>
            </button>
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.strike ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { strike: !activePara?.strike })}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
          </div>

          <div className="nb-word-toolbar-divider" />

          {/* Alignment */}
          <div className="nb-word-toolbar-group">
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.align === 'left' || !activePara?.align ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { align: 'left' })}
              title="Align Left"
            >
              ⫷
            </button>
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.align === 'center' ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { align: 'center' })}
              title="Align Center"
            >
              ≡
            </button>
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.align === 'right' ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { align: 'right' })}
              title="Align Right"
            >
              ⫸
            </button>
            <button
              type="button"
              className={`nb-word-tool-btn ${activePara?.align === 'justify' ? 'active' : ''}`}
              onClick={() => activeParaIdx !== null && updateParagraph(activeParaIdx, { align: 'justify' })}
              title="Justify"
            >
              ≣
            </button>
          </div>

          <div className="nb-word-toolbar-divider" />

          {/* Insert Content */}
          <div className="nb-word-toolbar-group">
            <button
              type="button"
              className="nb-word-tool-btn"
              onClick={() => addParagraph('p', activeParaIdx !== null ? activeParaIdx : undefined)}
              title="Insert New Paragraph Below"
            >
              + Paragraph
            </button>
            <button
              type="button"
              className="nb-word-tool-btn"
              onClick={() => addParagraph('h2', activeParaIdx !== null ? activeParaIdx : undefined)}
              title="Insert Subheading Below"
            >
              + Heading
            </button>
            <button
              type="button"
              className="nb-word-tool-btn"
              onClick={() => addParagraph('bullet', activeParaIdx !== null ? activeParaIdx : undefined)}
              title="Insert Bullet Point Below"
            >
              + Bullet
            </button>
            <button
              type="button"
              className="nb-word-tool-btn"
              onClick={() => addTable(activeParaIdx !== null ? activeParaIdx : undefined)}
              title="Insert 3x3 Table"
            >
              + Table
            </button>
          </div>
        </div>
      )}

      {/* Main Parchment Document Body */}
      <div className={`nb-word-parchment-body ${className}`}>
        {loading ? (
          <div className="nb-doc-loading">Loading Word document...</div>
        ) : (
          paragraphs.map((p, idx) => {
            const isSelected = isEditing && activeParaIdx === idx;

            if (p.type === 'table' && p.tableData) {
              return (
                <div
                  key={p.id || idx}
                  className={`nb-word-block-wrap ${isSelected ? 'nb-word-block--selected' : ''}`}
                  onClick={() => isEditing && setActiveParaIdx(idx)}
                >
                  <table className="nb-word-table">
                    <tbody>
                      {p.tableData.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? 'nb-word-table-header-row' : ''}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  className="nb-word-table-cell-input"
                                  value={cell}
                                  onChange={(e) => {
                                    const nextData = p.tableData!.map((r, rI) =>
                                      rI === rIdx ? r.map((c, cI) => (cI === cIdx ? e.target.value : c)) : r
                                    );
                                    updateParagraph(idx, { tableData: nextData });
                                  }}
                                />
                              ) : (
                                cell
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {isEditing && (
                    <div className="nb-word-table-controls">
                      <button
                        type="button"
                        className="nb-word-mini-btn"
                        onClick={() => {
                          const colCount = p.tableData![0]?.length || 2;
                          const newRow = Array(colCount).fill('');
                          updateParagraph(idx, { tableData: [...p.tableData!, newRow] });
                        }}
                        title="Add row to table"
                      >
                        + Row
                      </button>
                      <button
                        type="button"
                        className="nb-word-mini-btn"
                        onClick={() => {
                          const nextData = p.tableData!.map((r) => [...r, '']);
                          updateParagraph(idx, { tableData: nextData });
                        }}
                        title="Add column to table"
                      >
                        + Col
                      </button>
                      {p.tableData.length > 1 && (
                        <button
                          type="button"
                          className="nb-word-mini-btn"
                          onClick={() => {
                            updateParagraph(idx, { tableData: p.tableData!.slice(0, -1) });
                          }}
                          title="Remove last row"
                        >
                          - Row
                        </button>
                      )}
                      <button
                        type="button"
                        className="nb-word-mini-btn nb-word-mini-btn--danger"
                        onClick={() => deleteParagraph(idx)}
                        title="Delete entire table"
                      >
                        🗑 Table
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            const style: React.CSSProperties = {
              fontWeight: p.bold || p.type === 'h1' || p.type === 'h2' ? 'bold' : 'normal',
              fontStyle: p.italic ? 'italic' : 'normal',
              textDecoration: [
                p.underline ? 'underline' : '',
                p.strike ? 'line-through' : '',
              ].filter(Boolean).join(' ') || 'none',
              textAlign: p.align || 'left',
            };

            const renderElement = () => {
              if (isEditing) {
                return (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className={`nb-word-inline-editable nb-word-${p.type}`}
                    style={style}
                    onFocus={() => setActiveParaIdx(idx)}
                    onBlur={(e) => {
                      updateParagraph(idx, { text: e.currentTarget.innerText });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addParagraph(p.type === 'bullet' ? 'bullet' : p.type === 'numbered' ? 'numbered' : 'p', idx);
                      } else if (e.key === 'Backspace' && !e.currentTarget.innerText && paragraphs.length > 1) {
                        e.preventDefault();
                        deleteParagraph(idx);
                      }
                    }}
                  >
                    {p.text}
                  </div>
                );
              }

              switch (p.type) {
                case 'h1':
                  return <h1 className="nb-word-h1" style={style}>{p.text}</h1>;
                case 'h2':
                  return <h2 className="nb-word-h2" style={style}>{p.text}</h2>;
                case 'h3':
                  return <h3 className="nb-word-h3" style={style}>{p.text}</h3>;
                case 'h4':
                  return <h4 className="nb-word-h4" style={style}>{p.text}</h4>;
                case 'h5':
                  return <h5 className="nb-word-h5" style={style}>{p.text}</h5>;
                case 'h6':
                  return <h6 className="nb-word-h6" style={style}>{p.text}</h6>;
                case 'numbered':
                  return (
                    <div className="nb-word-numbered-item" style={style}>
                      <span className="nb-word-num-bullet">{idx + 1}.</span>
                      <span>{p.text}</span>
                    </div>
                  );
                case 'bullet':
                  return (
                    <li className="nb-word-bullet" style={style}>
                      {p.text}
                    </li>
                  );
                default:
                  return (
                    <p className="nb-word-p" style={style}>
                      {p.text || (isEditing ? ' ' : '')}
                    </p>
                  );
              }
            };

            return (
              <div
                key={p.id || idx}
                className={`nb-word-block-wrap ${isSelected ? 'nb-word-block--selected' : ''}`}
                onClick={() => isEditing && setActiveParaIdx(idx)}
              >
                {renderElement()}

                {isEditing && isSelected && (
                  <div className="nb-word-block-side-actions">
                    <button
                      type="button"
                      className="nb-word-side-btn"
                      disabled={idx === 0}
                      onClick={(e) => { e.stopPropagation(); moveParagraph(idx, 'up'); }}
                      title="Move up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      className="nb-word-side-btn"
                      disabled={idx === paragraphs.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveParagraph(idx, 'down'); }}
                      title="Move down"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      className="nb-word-side-btn nb-word-side-btn--danger"
                      onClick={(e) => { e.stopPropagation(); deleteParagraph(idx); }}
                      title="Delete block"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 4. PowerPoint Presentation Viewer (.pptx / .ppt)
// ============================================================================

export interface PresentationSlide {
  id?: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  texts: string[];
  notes?: string;
  layout?: 'title' | 'bullet' | 'two-column' | 'blank';
  bgColor?: string;
}

export function parsePptxBuffer(buffer: Uint8Array): PresentationSlide[] {
  try {
    const unzipped = fflate.unzipSync(buffer);
    const decoder = new TextDecoder('utf-8');
    const slides: PresentationSlide[] = [];

    let slideIdx = 1;
    while (true) {
      const slideFile = unzipped[`ppt/slides/slide${slideIdx}.xml`];
      if (!slideFile) break;

      const xml = decoder.decode(slideFile);
      const textMatches = xml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
      const texts: string[] = [];

      for (const t of textMatches) {
        const clean = unescapeXml(t.replace(/<[^>]+>/g, '').trim());
        if (clean) texts.push(clean);
      }

      let title = `Slide ${slideIdx}`;
      let bodyTexts: string[] = [];

      const titleShapeMatch = xml.match(/<p:sp>[\s\S]*?<p:ph[^>]*type="(title|ctrTitle)"[\s\S]*?<\/p:sp>/i);
      if (titleShapeMatch) {
        const tInTitle = titleShapeMatch[0].match(/<a:t>([\s\S]*?)<\/a:t>/g) || [];
        const titleParts = tInTitle.map((t) => unescapeXml(t.replace(/<[^>]+>/g, '').trim())).filter(Boolean);
        if (titleParts.length > 0) {
          title = titleParts.join(' ');
          bodyTexts = texts.filter((t) => !titleParts.includes(t));
        } else if (texts.length > 0) {
          title = texts[0];
          bodyTexts = texts.slice(1);
        }
      } else if (texts.length > 0) {
        title = texts[0];
        bodyTexts = texts.slice(1);
      }

      let notes = '';
      const notesFile = unzipped[`ppt/notesSlides/notesSlide${slideIdx}.xml`];
      if (notesFile) {
        const notesXml = decoder.decode(notesFile);
        const noteTexts = (notesXml.match(/<a:t>([\s\S]*?)<\/a:t>/g) || [])
          .map((t) => unescapeXml(t.replace(/<[^>]+>/g, '').trim()))
          .filter((t) => t && t !== `${slideIdx}`);
        notes = noteTexts.join('\n');
      }

      slides.push({
        id: `slide_${slideIdx}_${Math.random().toString(36).slice(2, 7)}`,
        slideNumber: slideIdx,
        title,
        texts: bodyTexts.length > 0 ? bodyTexts : (texts.length > 1 ? texts.slice(1) : []),
        notes,
      });

      slideIdx++;
    }

    return slides.length > 0
      ? slides
      : [{ id: 'slide_1', slideNumber: 1, title: 'Slide 1', texts: ['No text found in slide'] }];
  } catch (err: any) {
    return [{ id: 'slide_err', slideNumber: 1, title: 'Error', texts: [`Failed to parse PPTX: ${err.message}`] }];
  }
}

export function generatePptxBuffer(slides: PresentationSlide[]): Uint8Array {
  const safeSlides = slides.length > 0 ? slides : [{ id: 's1', slideNumber: 1, title: 'Slide 1', texts: [] }];

  let contentTypesOverrides = '';
  let presRels = '';
  let presSlideList = '';
  const files: Record<string, Uint8Array> = {};

  safeSlides.forEach((slide, idx) => {
    const sNum = idx + 1;
    const rId = `rId${sNum + 1}`;
    contentTypesOverrides += `<Override PartName="/ppt/slides/slide${sNum}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
    presRels += `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${sNum}.xml"/>\n`;
    presSlideList += `<p:sldId id="${255 + sNum}" r:id="${rId}"/>\n`;

    let bulletsXml = '';
    (slide.texts || []).forEach((t) => {
      bulletsXml += `<a:p><a:pPr lvl="0"/><a:r><a:rPr lang="en-US" dirty="0"/><a:t>${escapeXml(t)}</a:t></a:r></a:p>`;
    });

    const slideXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title 1"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="title"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="685800" y="609600"/><a:ext cx="7772400" cy="1143000"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" b="1"/><a:t>${escapeXml(slide.title || `Slide ${sNum}`)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Content 2"/><p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr><p:nvPr><p:ph type="body" idx="1"/></p:nvPr></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="685800" y="1981200"/><a:ext cx="7772400" cy="4525963"/></a:xfrm></p:spPr>
        <p:txBody><a:bodyPr/><a:lstStyle/>${bulletsXml}</p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;

    const slideRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

    files[`ppt/slides/slide${sNum}.xml`] = fflate.strToU8(slideXml);
    files[`ppt/slides/_rels/slide${sNum}.xml.rels`] = fflate.strToU8(slideRelsXml);
  });

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${contentTypesOverrides}
</Types>`;

  const rootRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;

  const presRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`;

  const presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>
    ${presSlideList}
  </p:sldIdLst>
  <p:sldSz cx="9144000" cy="6858000" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`;

  files['[Content_Types].xml'] = fflate.strToU8(contentTypesXml);
  files['_rels/.rels'] = fflate.strToU8(rootRelsXml);
  files['ppt/presentation.xml'] = fflate.strToU8(presentationXml);
  files['ppt/_rels/presentation.xml.rels'] = fflate.strToU8(presRelsXml);

  return fflate.zipSync(files);
}

export interface PresentationViewerProps {
  slides?: PresentationSlide[];
  fileUrl?: string;
  filename?: string;
  className?: string;
  containerClassName?: string;
  onSave?: (slides: PresentationSlide[]) => void;
  onSlidesChange?: (slides: PresentationSlide[]) => void;
  readOnly?: boolean;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  slides: propSlides,
  fileUrl,
  filename = 'presentation.pptx',
  className = '',
  containerClassName = '',
  onSave,
  onSlidesChange,
  readOnly = false,
}) => {
  const [slides, setSlides] = useState<PresentationSlide[]>(() => {
    if (propSlides && propSlides.length > 0) return propSlides;
    return [
      {
        id: 's_init_1',
        slideNumber: 1,
        title: 'Welcome Presentation',
        texts: ['Overview and Executive Summary', 'Key milestones and deliverables', 'Next steps and roadmap'],
      },
    ];
  });
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (propSlides && propSlides.length > 0) {
      setSlides(propSlides);
      return;
    }
    if (fileUrl) {
      setLoading(true);
      fetch(fileUrl)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          const parsed = parsePptxBuffer(new Uint8Array(buf));
          setSlides(parsed);
        })
        .catch((err) => {
          setSlides([{ id: 's_err', slideNumber: 1, title: 'Error', texts: [`Failed: ${err.message}`] }]);
        })
        .finally(() => setLoading(false));
    }
  }, [propSlides, fileUrl]);

  // Presenter mode timer
  useEffect(() => {
    let interval: any;
    if (isFullscreen) {
      interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isFullscreen]);

  const totalSlides = slides.length;
  const currentSlide = slides[currentSlideIdx] || slides[0] || { id: 's_fallback', slideNumber: 1, title: '', texts: [] };

  const handleNext = useCallback(() => setCurrentSlideIdx((prev) => Math.min(totalSlides - 1, prev + 1)), [totalSlides]);
  const handlePrev = useCallback(() => setCurrentSlideIdx((prev) => Math.max(0, prev - 1)), []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in an input or contentEditable, do not navigate slides
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true')) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        setCurrentSlideIdx(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setCurrentSlideIdx(totalSlides - 1);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isFullscreen, totalSlides]);

  const updateCurrentSlide = useCallback((updates: Partial<PresentationSlide>) => {
    setSlides((prev) => {
      const next = [...prev];
      next[currentSlideIdx] = { ...next[currentSlideIdx], ...updates };
      onSlidesChange?.(next);
      return next;
    });
  }, [currentSlideIdx, onSlidesChange]);

  const addSlide = () => {
    const newSlide: PresentationSlide = {
      id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      slideNumber: totalSlides + 1,
      title: `Slide ${totalSlides + 1}`,
      texts: ['New bullet point'],
    };
    setSlides((prev) => {
      const next = [...prev];
      const insertAt = currentSlideIdx + 1;
      next.splice(insertAt, 0, newSlide);
      // Re-number slides
      const renumbered = next.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      onSlidesChange?.(renumbered);
      return renumbered;
    });
    setCurrentSlideIdx((prev) => prev + 1);
  };

  const duplicateSlide = () => {
    const copy: PresentationSlide = {
      ...currentSlide,
      id: `slide_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      slideNumber: totalSlides + 1,
      title: `${currentSlide.title} (Copy)`,
      texts: [...currentSlide.texts],
    };
    setSlides((prev) => {
      const next = [...prev];
      next.splice(currentSlideIdx + 1, 0, copy);
      const renumbered = next.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      onSlidesChange?.(renumbered);
      return renumbered;
    });
    setCurrentSlideIdx((prev) => prev + 1);
  };

  const deleteSlide = (indexToDelete = currentSlideIdx) => {
    if (slides.length <= 1) {
      alert('A presentation must have at least one slide.');
      return;
    }
    setSlides((prev) => {
      const next = prev.filter((_, idx) => idx !== indexToDelete);
      const renumbered = next.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      onSlidesChange?.(renumbered);
      return renumbered;
    });
    setCurrentSlideIdx((prev) => Math.min(prev, totalSlides - 2));
  };

  const moveSlide = (fromIdx: number, direction: 'left' | 'right') => {
    const toIdx = direction === 'left' ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= totalSlides) return;
    setSlides((prev) => {
      const next = [...prev];
      const temp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = temp;
      const renumbered = next.map((s, idx) => ({ ...s, slideNumber: idx + 1 }));
      onSlidesChange?.(renumbered);
      return renumbered;
    });
    setCurrentSlideIdx(toIdx);
  };

  const addBullet = () => {
    const updatedTexts = [...currentSlide.texts, 'New point'];
    updateCurrentSlide({ texts: updatedTexts });
  };

  const updateBullet = (bIdx: number, text: string) => {
    const updatedTexts = [...currentSlide.texts];
    updatedTexts[bIdx] = text;
    updateCurrentSlide({ texts: updatedTexts });
  };

  const deleteBullet = (bIdx: number) => {
    const updatedTexts = currentSlide.texts.filter((_, i) => i !== bIdx);
    updateCurrentSlide({ texts: updatedTexts });
  };

  const moveBullet = (bIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? bIdx - 1 : bIdx + 1;
    if (targetIdx < 0 || targetIdx >= currentSlide.texts.length) return;
    const updatedTexts = [...currentSlide.texts];
    const temp = updatedTexts[bIdx];
    updatedTexts[bIdx] = updatedTexts[targetIdx];
    updatedTexts[targetIdx] = temp;
    updateCurrentSlide({ texts: updatedTexts });
  };

  const handleExportPptx = () => {
    const buffer = generatePptxBuffer(slides);
    const blob = new Blob([buffer as any], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pptx') ? filename : `${filename}.pptx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    onSave?.(slides);
    onSlidesChange?.(slides);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div
      className={`nb-document-viewer nb-presentation-container ${isFullscreen ? 'nb-presentation--fullscreen' : ''} ${containerClassName}`}
      data-filename={filename}
      contentEditable={false}
    >
      {/* Header Controls */}
      <div className="nb-presentation-header">
        <div className="nb-presentation-title">
          <span className="nb-doc-icon">📽</span>
          <span className="nb-doc-filename" title={filename}>{filename}</span>
          <span className="nb-presentation-counter">
            Slide {currentSlideIdx + 1} of {totalSlides}
          </span>
          {saveStatus === 'saved' && <span className="nb-word-saved-tag">✓ Saved</span>}
        </div>

        <div className="nb-presentation-actions">
          {isFullscreen && (
            <div className="nb-presenter-timer-badge" title="Presentation Time">
              ⏱ {formatTimer(elapsedSeconds)}
            </div>
          )}

          {!readOnly && (
            <button
              type="button"
              className={`nb-code-btn ${isEditing ? 'nb-code-btn--active' : ''}`}
              onClick={() => setIsEditing((p) => !p)}
              title={isEditing ? 'Exit Edit Mode' : 'Enter Inline Edit Mode'}
            >
              {isEditing ? '👁️ View' : '✏️ Edit'}
            </button>
          )}

          {!readOnly && (
            <button
              type="button"
              className="nb-code-btn"
              onClick={handleSave}
              title="Save Presentation Changes"
            >
              💾 Save
            </button>
          )}

          <button
            type="button"
            className="nb-code-btn"
            onClick={handleExportPptx}
            title="Generate & Download valid PPTX deck"
          >
            ⬇️ Export .pptx
          </button>

          <button
            type="button"
            className="nb-code-btn"
            onClick={() => setIsFullscreen((p) => !p)}
            title={isFullscreen ? 'Exit Presenter Mode (Esc)' : 'Enter Fullscreen Presenter Mode'}
          >
            {isFullscreen ? '✕ Exit' : '⛶ Present'}
          </button>

          {fileUrl && (
            <a href={fileUrl} download={filename} className="nb-code-btn" title="Download PPTX">
              ⬇️
            </a>
          )}
        </div>
      </div>

      {/* Slide Management Toolbar (In Edit Mode) */}
      {isEditing && !readOnly && (
        <div className="nb-presentation-toolbar">
          <div className="nb-presentation-toolbar-group">
            <button
              type="button"
              className="nb-presentation-tool-btn nb-presentation-tool-btn--primary"
              onClick={addSlide}
              title="Add a new slide"
            >
              + New Slide
            </button>
            <button
              type="button"
              className="nb-presentation-tool-btn"
              onClick={duplicateSlide}
              title="Duplicate current slide"
            >
              📋 Duplicate
            </button>
            <button
              type="button"
              className="nb-presentation-tool-btn"
              disabled={currentSlideIdx === 0}
              onClick={() => moveSlide(currentSlideIdx, 'left')}
              title="Move slide earlier (left)"
            >
              ◀ Move Left
            </button>
            <button
              type="button"
              className="nb-presentation-tool-btn"
              disabled={currentSlideIdx === totalSlides - 1}
              onClick={() => moveSlide(currentSlideIdx, 'right')}
              title="Move slide later (right)"
            >
              ▶ Move Right
            </button>
            <button
              type="button"
              className="nb-presentation-tool-btn nb-presentation-tool-btn--danger"
              onClick={() => deleteSlide(currentSlideIdx)}
              title="Delete current slide"
            >
              🗑 Delete Slide
            </button>
          </div>

          <div className="nb-presentation-toolbar-divider" />

          <div className="nb-presentation-toolbar-group">
            <button
              type="button"
              className="nb-presentation-tool-btn"
              onClick={addBullet}
              title="Add bullet item to current slide"
            >
              + Add Bullet
            </button>
            <button
              type="button"
              className={`nb-presentation-tool-btn ${showNotes ? 'active' : ''}`}
              onClick={() => setShowNotes((p) => !p)}
              title="Toggle speaker notes"
            >
              📝 Notes
            </button>
          </div>
        </div>
      )}

      {/* Main Slide Stage */}
      <div className={`nb-presentation-stage ${className}`}>
        {loading ? (
          <div className="nb-doc-loading">Loading presentation slides...</div>
        ) : (
          <div className="nb-presentation-slide-card">
            {/* Slide Title */}
            {isEditing && !readOnly ? (
              <input
                type="text"
                className="nb-slide-heading-input"
                value={currentSlide.title || ''}
                onChange={(e) => updateCurrentSlide({ title: e.target.value })}
                placeholder="Enter slide title..."
              />
            ) : (
              <h2 className="nb-slide-heading">{currentSlide.title || `Slide ${currentSlide.slideNumber}`}</h2>
            )}

            {/* Slide Bullet List */}
            <div className="nb-slide-body">
              {currentSlide.texts.map((txt, tIdx) => (
                <div key={tIdx} className="nb-slide-bullet-row">
                  <span className="nb-slide-dot">◆</span>
                  {isEditing && !readOnly ? (
                    <div className="nb-slide-bullet-edit-wrap">
                      <input
                        type="text"
                        className="nb-slide-bullet-input"
                        value={txt}
                        onChange={(e) => updateBullet(tIdx, e.target.value)}
                        placeholder="Bullet content..."
                      />
                      <div className="nb-slide-bullet-actions">
                        <button
                          type="button"
                          className="nb-slide-bullet-btn"
                          disabled={tIdx === 0}
                          onClick={() => moveBullet(tIdx, 'up')}
                          title="Move bullet up"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="nb-slide-bullet-btn"
                          disabled={tIdx === currentSlide.texts.length - 1}
                          onClick={() => moveBullet(tIdx, 'down')}
                          title="Move bullet down"
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          className="nb-slide-bullet-btn nb-slide-bullet-btn--danger"
                          onClick={() => deleteBullet(tIdx)}
                          title="Delete bullet"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="nb-slide-bullet-text">{txt}</span>
                  )}
                </div>
              ))}

              {isEditing && !readOnly && currentSlide.texts.length === 0 && (
                <button
                  type="button"
                  className="nb-slide-add-bullet-placeholder"
                  onClick={addBullet}
                >
                  + Add first bullet point
                </button>
              )}
            </div>

            {/* Speaker Notes Drawer */}
            {(showNotes || (isFullscreen && currentSlide.notes)) && (
              <div className="nb-slide-notes-panel">
                <div className="nb-slide-notes-header">Speaker Notes:</div>
                {isEditing && !readOnly ? (
                  <textarea
                    className="nb-slide-notes-textarea"
                    value={currentSlide.notes || ''}
                    onChange={(e) => updateCurrentSlide({ notes: e.target.value })}
                    placeholder="Type presenter notes for this slide..."
                    rows={3}
                  />
                ) : (
                  <div className="nb-slide-notes-content">
                    {currentSlide.notes || 'No speaker notes for this slide.'}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Stage Nav Arrows */}
        <button
          type="button"
          className="nb-slide-nav nb-slide-nav--prev"
          disabled={currentSlideIdx === 0}
          onClick={handlePrev}
          title="Previous slide (← / Space)"
        >
          ‹
        </button>
        <button
          type="button"
          className="nb-slide-nav nb-slide-nav--next"
          disabled={currentSlideIdx >= totalSlides - 1}
          onClick={handleNext}
          title="Next slide (→ / Space)"
        >
          ›
        </button>
      </div>

      {/* Thumbnails Navigation Strip */}
      {totalSlides > 0 && (
        <div className="nb-presentation-thumbnails">
          {slides.map((s, idx) => (
            <div
              key={s.id || idx}
              className={`nb-slide-thumb-container ${idx === currentSlideIdx ? 'active' : ''}`}
            >
              <button
                type="button"
                className={`nb-slide-thumb ${idx === currentSlideIdx ? 'active' : ''}`}
                onClick={() => setCurrentSlideIdx(idx)}
                title={`Slide ${idx + 1}: ${s.title || 'Untitled'}`}
              >
                <div className="nb-thumb-header">
                  <span className="nb-thumb-num">{idx + 1}</span>
                  {isEditing && !readOnly && slides.length > 1 && (
                    <button
                      type="button"
                      className="nb-thumb-quick-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSlide(idx);
                      }}
                      title="Delete slide"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="nb-thumb-preview">{s.title || `Slide ${idx + 1}`}</div>
                <div className="nb-thumb-bullets-preview">
                  {(s.texts || []).slice(0, 2).map((t, bI) => (
                    <div key={bI} className="nb-thumb-bullet-line">
                      • {t}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          ))}

          {isEditing && !readOnly && (
            <button
              type="button"
              className="nb-slide-thumb-add-btn"
              onClick={addSlide}
              title="Add slide"
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. Plain Text & Markdown Viewer (.txt, .md, .log, .json, .yaml, .xml)
// ============================================================================

export interface TextViewerProps {
  content?: string;
  fileUrl?: string;
  filename?: string;
  className?: string;
  containerClassName?: string;
}

export const TextViewer: React.FC<TextViewerProps> = ({
  content: propContent,
  fileUrl,
  filename = 'document.txt',
  className = '',
  containerClassName = '',
}) => {
  const [content, setContent] = useState<string>(propContent || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propContent !== undefined) {
      setContent(propContent);
      return;
    }
    if (fileUrl) {
      setLoading(true);
      fetch(fileUrl)
        .then((res) => res.text())
        .then((txt) => setContent(txt))
        .catch((err) => setContent(`Error loading text file: ${err.message}`))
        .finally(() => setLoading(false));
    }
  }, [propContent, fileUrl]);

  return (
    <HeavyCodeViewer
      code={content || (loading ? 'Loading...' : '')}
      filename={filename}
      containerClassName={containerClassName}
      className={className}
    />
  );
};

// ============================================================================
// 6. In-Browser Multi-Page PDF Document Viewer (.pdf)
// ============================================================================

export interface PdfMetadata {
  pageCount: number;
  title?: string;
  version?: string;
  author?: string;
}

/**
 * Binary-safe parser extracting page count and metadata from raw PDF array buffer.
 */
export function parsePdfBuffer(buffer: Uint8Array): PdfMetadata {
  try {
    const decoder = new TextDecoder('latin1');
    const pdfText = decoder.decode(buffer);

    // 1. Detect PDF version header (%PDF-1.x / %PDF-2.x)
    const versionMatch = pdfText.match(/%PDF-([0-9.]+)/);
    const version = versionMatch ? versionMatch[1] : '1.4';

    // 2. Count pages: look for /Count in /Pages dictionary or count /Type\s*/Page (not /Pages)
    let pageCount = 0;
    const pagesCountMatch = pdfText.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/);
    if (pagesCountMatch) {
      pageCount = parseInt(pagesCountMatch[1], 10);
    }

    if (!pageCount || isNaN(pageCount)) {
      // Fallback: match individual /Type /Page occurrences (excluding /Type /Pages)
      const pageTypeMatches = pdfText.match(/\/Type\s*\/Page\b/g);
      if (pageTypeMatches && pageTypeMatches.length > 0) {
        pageCount = pageTypeMatches.length;
      }
    }

    if (!pageCount || isNaN(pageCount) || pageCount < 1) {
      pageCount = 1;
    }

    // 3. Extract title if present in Info dict
    let title: string | undefined;
    const titleMatch = pdfText.match(/\/Title\s*\((.*?)\)/);
    if (titleMatch) {
      title = titleMatch[1].replace(/\\([()\\])/g, '$1');
    }

    return { pageCount, title, version };
  } catch (err) {
    return { pageCount: 1, version: '1.4' };
  }
}

export interface PdfDocumentViewerProps {
  fileUrl?: string;
  data?: Uint8Array | ArrayBuffer;
  filename?: string;
  pageCount?: number;
  initialPage?: number;
  className?: string;
  containerClassName?: string;
}

export const PdfDocumentViewer: React.FC<PdfDocumentViewerProps> = ({
  fileUrl,
  data,
  filename = 'document.pdf',
  pageCount: propPageCount,
  initialPage = 1,
  className = '',
  containerClassName = '',
}) => {
  const [totalPages, setTotalPages] = useState<number>(propPageCount || 1);
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [pageInput, setPageInput] = useState<string>(String(initialPage));
  const [zoom, setZoom] = useState<number>(100);
  const [fitMode, setFitMode] = useState<'width' | 'custom'>('custom');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [pdfMeta, setPdfMeta] = useState<PdfMetadata>({ pageCount: propPageCount || 1, version: '1.4' });

  // Load PDF metadata from data buffer or remote fileUrl
  useEffect(() => {
    if (data) {
      const u8 = data instanceof Uint8Array ? data : new Uint8Array(data);
      const meta = parsePdfBuffer(u8);
      setPdfMeta(meta);
      if (meta.pageCount > 0) {
        setTotalPages(meta.pageCount);
      }
      return;
    }

    if (fileUrl) {
      setLoading(true);
      fetch(fileUrl)
        .then((res) => res.arrayBuffer())
        .then((buf) => {
          const meta = parsePdfBuffer(new Uint8Array(buf));
          setPdfMeta(meta);
          if (meta.pageCount > 0) {
            setTotalPages(meta.pageCount);
          }
        })
        .catch((err) => {
          console.warn('Could not parse remote PDF metadata:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [data, fileUrl, propPageCount]);

  // Keep pageInput synced with currentPage
  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  // Global key navigation in fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isFullscreen, totalPages]);

  const goToPage = (p: number) => {
    const valid = Math.max(1, Math.min(totalPages, p));
    setCurrentPage(valid);
    setPageInput(String(valid));
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const parsed = parseInt(pageInput, 10);
      if (!isNaN(parsed)) {
        goToPage(parsed);
      } else {
        setPageInput(String(currentPage));
      }
    }
  };

  const handleZoomIn = () => {
    setFitMode('custom');
    setZoom((z) => Math.min(300, z + 25));
  };

  const handleZoomOut = () => {
    setFitMode('custom');
    setZoom((z) => Math.max(25, z - 25));
  };

  const handleFitWidth = () => {
    if (fitMode === 'width') {
      setFitMode('custom');
      setZoom(100);
    } else {
      setFitMode('width');
      setZoom(100);
    }
  };

  const handleResetZoom = () => {
    setFitMode('custom');
    setZoom(100);
  };

  const effectivePdfSrc = useMemo(() => {
    if (!fileUrl) return '';
    const hash = `#page=${currentPage}&zoom=${fitMode === 'width' ? 'page-width' : zoom}`;
    return fileUrl + (fileUrl.includes('#') ? '' : hash);
  }, [fileUrl, currentPage, zoom, fitMode]);

  return (
    <div
      className={`nb-document-viewer nb-pdf-container ${isFullscreen ? 'nb-pdf--fullscreen' : ''} ${containerClassName}`}
      data-filename={filename}
      data-url={fileUrl}
      data-page-count={totalPages}
      contentEditable={false}
    >
      {/* Header Bar */}
      <div className="nb-pdf-header">
        <div className="nb-pdf-title">
          <span className="nb-doc-icon">📕</span>
          <span className="nb-doc-filename" title={filename}>{filename}</span>
          <span className="nb-pdf-badge">PDF {pdfMeta.version}</span>
          <span className="nb-pdf-count-badge">
            {totalPages} {totalPages === 1 ? 'page' : 'pages'}
          </span>
        </div>

        <div className="nb-pdf-actions">
          <button
            type="button"
            className={`nb-code-btn ${showThumbnails ? 'nb-code-btn--active' : ''}`}
            onClick={() => setShowThumbnails((p) => !p)}
            title="Toggle Page Thumbnails"
          >
            📑 Thumbnails
          </button>

          <button
            type="button"
            className="nb-code-btn"
            onClick={() => setIsFullscreen((p) => !p)}
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Fullscreen Viewer Mode'}
          >
            {isFullscreen ? '✕ Exit' : '⛶ Fullscreen'}
          </button>

          {fileUrl && (
            <a href={fileUrl} download={filename} className="nb-code-btn" title="Download PDF File">
              ⬇️ Download
            </a>
          )}
        </div>
      </div>

      {/* Control Navigation & Zoom Bar */}
      <div className="nb-pdf-toolbar">
        {/* Page Navigation Controls */}
        <div className="nb-pdf-nav-group">
          <button
            type="button"
            className="nb-pdf-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => goToPage(1)}
            title="First page (Home)"
          >
            |◀
          </button>
          <button
            type="button"
            className="nb-pdf-nav-btn"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
            title="Previous page (Left arrow)"
          >
            ◀
          </button>

          <div className="nb-pdf-jump-box">
            <span>Page</span>
            <input
              type="text"
              className="nb-pdf-jump-input"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInputKeyDown}
              onBlur={() => {
                const parsed = parseInt(pageInput, 10);
                if (!isNaN(parsed)) goToPage(parsed);
                else setPageInput(String(currentPage));
              }}
              title="Type page number and press Enter"
            />
            <span>of {totalPages}</span>
          </div>

          <button
            type="button"
            className="nb-pdf-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
            title="Next page (Right arrow)"
          >
            ▶
          </button>
          <button
            type="button"
            className="nb-pdf-nav-btn"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(totalPages)}
            title="Last page (End)"
          >
            ▶|
          </button>
        </div>

        <div className="nb-pdf-toolbar-divider" />

        {/* Zoom Controls */}
        <div className="nb-pdf-zoom-group">
          <button
            type="button"
            className="nb-pdf-zoom-btn"
            onClick={handleZoomOut}
            disabled={zoom <= 25}
            title="Zoom Out (−)"
          >
            −
          </button>
          <button
            type="button"
            className="nb-pdf-zoom-label-btn"
            onClick={handleResetZoom}
            title="Reset Zoom to 100%"
          >
            {fitMode === 'width' ? 'Fit Width' : `${zoom}%`}
          </button>
          <button
            type="button"
            className="nb-pdf-zoom-btn"
            onClick={handleZoomIn}
            disabled={zoom >= 300}
            title="Zoom In (+)"
          >
            +
          </button>
          <button
            type="button"
            className={`nb-pdf-tool-btn ${fitMode === 'width' ? 'active' : ''}`}
            onClick={handleFitWidth}
            title="Fit to Page Width"
          >
            ↔ Fit Width
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className={`nb-pdf-stage ${className}`}>
        {loading ? (
          <div className="nb-doc-loading">Loading PDF document...</div>
        ) : fileUrl ? (
          <div className="nb-pdf-frame-wrapper" style={{ width: fitMode === 'width' ? '100%' : `${zoom}%` }}>
            <object
              data={effectivePdfSrc}
              type="application/pdf"
              className="nb-pdf-object"
              title={filename}
            >
              <iframe
                src={effectivePdfSrc}
                className="nb-pdf-frame"
                title={filename}
              >
                <div className="nb-pdf-fallback">
                  <p>Your browser does not support inline PDF viewing.</p>
                  <a href={fileUrl} download={filename} className="nb-code-btn">
                    Download {filename}
                  </a>
                </div>
              </iframe>
            </object>
          </div>
        ) : (
          <div className="nb-pdf-empty-card">
            <span className="nb-pdf-empty-icon">📄</span>
            <h3>{filename}</h3>
            <p>PDF Document ({totalPages} pages)</p>
          </div>
        )}
      </div>

      {/* Thumbnail Drawer */}
      {showThumbnails && totalPages > 0 && (
        <div className="nb-pdf-thumbnails">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            return (
              <button
                key={pageNum}
                type="button"
                className={`nb-pdf-thumb ${pageNum === currentPage ? 'active' : ''}`}
                onClick={() => goToPage(pageNum)}
                title={`Jump to Page ${pageNum}`}
              >
                <div className="nb-pdf-thumb-card">
                  <div className="nb-pdf-thumb-preview">
                    <span className="nb-pdf-thumb-icon">📄</span>
                    <span className="nb-pdf-thumb-page-text">P. {pageNum}</span>
                  </div>
                </div>
                <div className="nb-pdf-thumb-number">Page {pageNum}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
