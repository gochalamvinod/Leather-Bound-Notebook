import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CellFormat {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  align?: 'left' | 'center' | 'right';
  bgColor?: string;
  textColor?: string;
  numFormat?: 'general' | 'currency' | 'percent' | 'number' | 'integer';
  decimals?: number;
}

export interface CellCoord {
  row: number;
  col: number;
}

export interface CellRange {
  startRow: number;
  startCol: number;
  endRow: number;
  endCol: number;
}

export interface SpreadsheetSheet {
  name: string;
  rows: string[][];
  formats?: Record<string, CellFormat>; // key: "r_c" e.g. "0_0"
  colWidths?: Record<number, number>;
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  title: string;
  labelCol: number;
  valueCols: number[];
  showLegend: boolean;
  showGrid: boolean;
}

export interface SpreadsheetEditorProps {
  data?: SpreadsheetSheet[] | string[][];
  initialCsv?: string;
  fileUrl?: string;
  filename?: string;
  readOnly?: boolean;
  onSave?: (sheets: SpreadsheetSheet[]) => void;
  onDataChange?: (sheets: SpreadsheetSheet[]) => void;
  className?: string;
  containerClassName?: string;
}

// ============================================================================
// Coordinate & Range Helper Functions
// ============================================================================

/**
 * Converts a 0-based column index to an Excel column letter (e.g. 0 -> "A", 25 -> "Z", 26 -> "AA")
 */
export function colIndexToLetter(index: number): string {
  let letter = '';
  let temp = index;
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

/**
 * Converts an Excel column letter to a 0-based column index (e.g. "A" -> 0, "Z" -> 25, "AA" -> 26)
 */
export function letterToColIndex(letter: string): number {
  const clean = (letter || '').toUpperCase().trim();
  let index = 0;
  for (let i = 0; i < clean.length; i++) {
    index = index * 26 + (clean.charCodeAt(i) - 64);
  }
  return Math.max(0, index - 1);
}

/**
 * Creates a coordinate key "r_c" for lookup
 */
export function getCellKey(row: number, col: number): string {
  return `${row}_${col}`;
}

/**
 * Converts row and col to standard coordinate string e.g. (0, 0) -> "A1"
 */
export function coordToA1(row: number, col: number): string {
  return `${colIndexToLetter(col)}${row + 1}`;
}

/**
 * Parses coordinate string e.g. "A1", "$B$5" into { row, col }
 */
export function parseA1Coord(coordStr: string): CellCoord | null {
  const clean = coordStr.replace(/\$/g, '').trim().toUpperCase();
  const match = clean.match(/^([A-Z]+)(\d+)$/);
  if (!match) return null;
  const colLetter = match[1];
  const rowNum = parseInt(match[2], 10);
  if (isNaN(rowNum) || rowNum <= 0) return null;
  return {
    col: letterToColIndex(colLetter),
    row: rowNum - 1,
  };
}

/**
 * Parses range string e.g. "A1:B10" into CellRange
 */
export function parseRange(rangeStr: string): CellRange | null {
  const clean = rangeStr.replace(/\$/g, '').trim().toUpperCase();
  const parts = clean.split(':');
  if (parts.length === 1) {
    const coord = parseA1Coord(parts[0]);
    if (!coord) return null;
    return { startRow: coord.row, startCol: coord.col, endRow: coord.row, endCol: coord.col };
  }
  if (parts.length === 2) {
    const c1 = parseA1Coord(parts[0]);
    const c2 = parseA1Coord(parts[1]);
    if (!c1 || !c2) return null;
    return {
      startRow: Math.min(c1.row, c2.row),
      startCol: Math.min(c1.col, c2.col),
      endRow: Math.max(c1.row, c2.row),
      endCol: Math.max(c1.col, c2.col),
    };
  }
  return null;
}

// ============================================================================
// Formula Evaluation Engine
// ============================================================================

/**
 * Evaluates a single formula string (e.g. "=SUM(A1:A5)", "=A1+B2*3")
 * within the context of a 2D sheet rows matrix.
 */
export function evaluateFormula(
  formulaStr: string,
  rows: string[][],
  visitedCells = new Set<string>()
): string | number {
  if (!formulaStr || !formulaStr.startsWith('=')) {
    return formulaStr;
  }

  const expr = formulaStr.slice(1).trim();
  if (!expr) return '';

  try {
    return evaluateExpression(expr, rows, visitedCells);
  } catch (err: any) {
    return '#ERROR!';
  }
}

/**
 * Get raw cell value at row, col
 */
function getRawCellValue(row: number, col: number, rows: string[][]): string {
  if (row < 0 || row >= rows.length) return '';
  const r = rows[row];
  if (!r || col < 0 || col >= r.length) return '';
  return r[col] !== undefined ? String(r[col]) : '';
}

/**
 * Resolves a cell coordinate to its evaluated numeric or string value
 */
function resolveCellValue(
  row: number,
  col: number,
  rows: string[][],
  visitedCells = new Set<string>()
): string | number {
  const cellKey = getCellKey(row, col);
  if (visitedCells.has(cellKey)) {
    return '#CIRCULAR!';
  }

  const raw = getRawCellValue(row, col, rows);
  if (raw.startsWith('=')) {
    const nextVisited = new Set(visitedCells);
    nextVisited.add(cellKey);
    return evaluateFormula(raw, rows, nextVisited);
  }

  const num = Number(raw);
  if (!isNaN(num) && raw.trim() !== '') {
    return num;
  }
  return raw;
}

/**
 * Evaluates mathematical/logical expressions with functions and cell references
 */
function evaluateExpression(
  expr: string,
  rows: string[][],
  visitedCells = new Set<string>()
): string | number {
  // 1. Check for Top-Level Functions: SUM, AVERAGE, MIN, MAX, COUNT, PRODUCT, IF, etc.
  const fnMatch = expr.match(/^([A-Z_]+)\s*\((.*)\)$/i);
  if (fnMatch) {
    const fnName = fnMatch[1].toUpperCase();
    const innerArgs = splitFunctionArgs(fnMatch[2]);
    return executeFunction(fnName, innerArgs, rows, visitedCells);
  }

  // 2. Tokenize and Evaluate Arithmetic / String Expression
  return evaluateArithmetic(expr, rows, visitedCells);
}

/**
 * Safely splits function arguments taking nested parens and quotes into account
 */
function splitFunctionArgs(argsStr: string): string[] {
  const args: string[] = [];
  let current = '';
  let parenDepth = 0;
  let inQuotes = false;

  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (ch === '"' && argsStr[i - 1] !== '\\') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (inQuotes) {
      current += ch;
    } else if (ch === '(') {
      parenDepth++;
      current += ch;
    } else if (ch === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      current += ch;
    } else if (ch === ',' && parenDepth === 0) {
      args.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
}

/**
 * Flattens a list of argument strings (which may be cell coordinates, ranges, numbers, or expressions)
 * into an array of resolved values.
 */
function flattenNumericArgs(
  args: string[],
  rows: string[][],
  visitedCells = new Set<string>()
): number[] {
  const values: number[] = [];

  for (const arg of args) {
    const cleanArg = arg.trim();
    if (!cleanArg) continue;

    // Check if range e.g. A1:B10
    const range = parseRange(cleanArg);
    if (range && cleanArg.includes(':')) {
      for (let r = range.startRow; r <= range.endRow; r++) {
        for (let c = range.startCol; c <= range.endCol; c++) {
          const val = resolveCellValue(r, c, rows, visitedCells);
          if (typeof val === 'number') {
            values.push(val);
          } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
            values.push(Number(val));
          }
        }
      }
      continue;
    }

    // Check if single cell reference e.g. A1
    const coord = parseA1Coord(cleanArg);
    if (coord) {
      const val = resolveCellValue(coord.row, coord.col, rows, visitedCells);
      if (typeof val === 'number') {
        values.push(val);
      } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
        values.push(Number(val));
      }
      continue;
    }

    // Direct expression or number
    const val = evaluateExpression(cleanArg, rows, visitedCells);
    if (typeof val === 'number') {
      values.push(val);
    } else if (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))) {
      values.push(Number(val));
    }
  }

  return values;
}

/**
 * Executes a standard spreadsheet function
 */
function executeFunction(
  fnName: string,
  args: string[],
  rows: string[][],
  visitedCells = new Set<string>()
): string | number {
  switch (fnName) {
    case 'SUM': {
      const nums = flattenNumericArgs(args, rows, visitedCells);
      return nums.reduce((acc, n) => acc + n, 0);
    }
    case 'AVERAGE':
    case 'AVG': {
      const nums = flattenNumericArgs(args, rows, visitedCells);
      if (nums.length === 0) return 0;
      return nums.reduce((acc, n) => acc + n, 0) / nums.length;
    }
    case 'MIN': {
      const nums = flattenNumericArgs(args, rows, visitedCells);
      if (nums.length === 0) return 0;
      return Math.min(...nums);
    }
    case 'MAX': {
      const nums = flattenNumericArgs(args, rows, visitedCells);
      if (nums.length === 0) return 0;
      return Math.max(...nums);
    }
    case 'COUNT': {
      const nums = flattenNumericArgs(args, rows, visitedCells);
      return nums.length;
    }
    case 'PRODUCT': {
      const nums = flattenNumericArgs(args, rows, visitedCells);
      if (nums.length === 0) return 0;
      return nums.reduce((acc, n) => acc * n, 1);
    }
    case 'MEDIAN': {
      const nums = flattenNumericArgs(args, rows, visitedCells).sort((a, b) => a - b);
      if (nums.length === 0) return 0;
      const mid = Math.floor(nums.length / 2);
      return nums.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
    }
    case 'ROUND': {
      const num = Number(evaluateExpression(args[0] || '0', rows, visitedCells));
      const decimals = args[1] ? Number(evaluateExpression(args[1], rows, visitedCells)) : 0;
      if (isNaN(num)) return '#VALUE!';
      const factor = Math.pow(10, decimals || 0);
      return Math.round(num * factor) / factor;
    }
    case 'ABS': {
      const num = Number(evaluateExpression(args[0] || '0', rows, visitedCells));
      return isNaN(num) ? '#VALUE!' : Math.abs(num);
    }
    case 'SQRT': {
      const num = Number(evaluateExpression(args[0] || '0', rows, visitedCells));
      if (isNaN(num) || num < 0) return '#NUM!';
      return Math.sqrt(num);
    }
    case 'POWER': {
      const base = Number(evaluateExpression(args[0] || '0', rows, visitedCells));
      const exp = Number(evaluateExpression(args[1] || '1', rows, visitedCells));
      return Math.pow(base, exp);
    }
    case 'IF': {
      if (args.length < 2) return '#ERROR!';
      const conditionRes = evaluateExpression(args[0], rows, visitedCells);
      const isTrue =
        (conditionRes as unknown) === true ||
        conditionRes === 'TRUE' ||
        conditionRes === 1 ||
        String(conditionRes).toUpperCase() === 'TRUE' ||
        (typeof conditionRes === 'number' && conditionRes !== 0);
      if (isTrue) {
        return evaluateExpression(args[1], rows, visitedCells);
      }
      return args[2] !== undefined ? evaluateExpression(args[2], rows, visitedCells) : '';
    }
    case 'CONCAT':
    case 'CONCATENATE': {
      return args
        .map((a) => {
          const val = evaluateExpression(a, rows, visitedCells);
          return val !== undefined && val !== null ? String(val) : '';
        })
        .join('');
    }
    case 'LEN': {
      const str = String(evaluateExpression(args[0] || '', rows, visitedCells));
      return str.length;
    }
    case 'UPPER': {
      return String(evaluateExpression(args[0] || '', rows, visitedCells)).toUpperCase();
    }
    case 'LOWER': {
      return String(evaluateExpression(args[0] || '', rows, visitedCells)).toLowerCase();
    }
    case 'TRIM': {
      return String(evaluateExpression(args[0] || '', rows, visitedCells)).trim();
    }
    case 'TODAY': {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    case 'NOW': {
      return new Date().toLocaleString();
    }
    default:
      return `#NAME?`;
  }
}

/**
 * Evaluates basic arithmetic with operator precedence (+, -, *, /, ^, %, &)
 */
function evaluateArithmetic(
  expr: string,
  rows: string[][],
  visitedCells = new Set<string>()
): string | number {
  const cleanExpr = expr.trim();
  if (!cleanExpr) return '';

  // 1. Check String Literals e.g. "Hello"
  if (/^"([^"]*)"$/.test(cleanExpr)) {
    return cleanExpr.slice(1, -1);
  }

  // 2. String Concatenation operator &
  if (cleanExpr.includes('&')) {
    const parts = splitByTopLevelOperator(cleanExpr, '&');
    if (parts.length > 1) {
      return parts.map((p) => String(evaluateExpression(p, rows, visitedCells))).join('');
    }
  }

  // 3. Comparison operators (=, <>, !=, <=, >=, <, >)
  const comparisonOps = ['<=', '>=', '<>', '!=', '=', '<', '>'];
  for (const op of comparisonOps) {
    const parts = splitByTopLevelOperator(cleanExpr, op);
    if (parts.length === 2) {
      const left = evaluateExpression(parts[0], rows, visitedCells);
      const right = evaluateExpression(parts[1], rows, visitedCells);
      switch (op) {
        case '=':
          return left == right ? 1 : 0;
        case '<>':
        case '!=':
          return left != right ? 1 : 0;
        case '<=':
          return Number(left) <= Number(right) ? 1 : 0;
        case '>=':
          return Number(left) >= Number(right) ? 1 : 0;
        case '<':
          return Number(left) < Number(right) ? 1 : 0;
        case '>':
          return Number(left) > Number(right) ? 1 : 0;
      }
    }
  }

  // 4. Addition / Subtraction
  const addSubParts = splitByTopLevelAddSub(cleanExpr);
  if (addSubParts.length > 1) {
    let result = Number(evaluateExpression(addSubParts[0].val, rows, visitedCells));
    for (let i = 1; i < addSubParts.length; i++) {
      const nextVal = Number(evaluateExpression(addSubParts[i].val, rows, visitedCells));
      if (addSubParts[i].op === '+') {
        result += nextVal;
      } else {
        result -= nextVal;
      }
    }
    return isNaN(result) ? '#VALUE!' : result;
  }

  // 5. Multiplication / Division
  const mulDivParts = splitByTopLevelMulDiv(cleanExpr);
  if (mulDivParts.length > 1) {
    let result = Number(evaluateExpression(mulDivParts[0].val, rows, visitedCells));
    for (let i = 1; i < mulDivParts.length; i++) {
      const nextVal = Number(evaluateExpression(mulDivParts[i].val, rows, visitedCells));
      if (mulDivParts[i].op === '*') {
        result *= nextVal;
      } else {
        if (nextVal === 0) return '#DIV/0!';
        result /= nextVal;
      }
    }
    return isNaN(result) ? '#VALUE!' : result;
  }

  // 6. Parentheses stripping
  if (cleanExpr.startsWith('(') && cleanExpr.endsWith(')')) {
    const inner = cleanExpr.slice(1, -1);
    let depth = 0;
    let isBalanced = true;
    for (let i = 0; i < inner.length; i++) {
      if (inner[i] === '(') depth++;
      else if (inner[i] === ')') depth--;
      if (depth < 0) {
        isBalanced = false;
        break;
      }
    }
    if (isBalanced && depth === 0) {
      return evaluateExpression(inner, rows, visitedCells);
    }
  }

  // 7. Cell Reference e.g. A1, $A$1
  const coord = parseA1Coord(cleanExpr);
  if (coord) {
    return resolveCellValue(coord.row, coord.col, rows, visitedCells);
  }

  // 8. Number
  const num = Number(cleanExpr);
  if (!isNaN(num)) return num;

  return cleanExpr;
}

function splitByTopLevelOperator(expr: string, op: string): string[] {
  let depth = 0;
  let inQuotes = false;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' && expr[i - 1] !== '\\') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (depth === 0 && expr.substr(i, op.length) === op) {
        return [expr.slice(0, i).trim(), expr.slice(i + op.length).trim()];
      }
    }
  }
  return [expr];
}

function splitByTopLevelAddSub(expr: string): { op: '+' | '-'; val: string }[] {
  const parts: { op: '+' | '-'; val: string }[] = [];
  let depth = 0;
  let inQuotes = false;
  let lastIdx = 0;
  let currentOp: '+' | '-' = '+';

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' && expr[i - 1] !== '\\') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (depth === 0 && (ch === '+' || ch === '-')) {
        if (i > 0 && !/[+\-*/%^&=(,]/.test(expr[i - 1].trim())) {
          parts.push({ op: currentOp, val: expr.slice(lastIdx, i).trim() });
          currentOp = ch as '+' | '-';
          lastIdx = i + 1;
        }
      }
    }
  }

  if (lastIdx < expr.length) {
    parts.push({ op: currentOp, val: expr.slice(lastIdx).trim() });
  }

  return parts.length > 1 ? parts : [];
}

function splitByTopLevelMulDiv(expr: string): { op: '*' | '/'; val: string }[] {
  const parts: { op: '*' | '/'; val: string }[] = [];
  let depth = 0;
  let inQuotes = false;
  let lastIdx = 0;
  let currentOp: '*' | '/' = '*';

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '"' && expr[i - 1] !== '\\') inQuotes = !inQuotes;
    else if (!inQuotes) {
      if (ch === '(') depth++;
      else if (ch === ')') depth = Math.max(0, depth - 1);
      else if (depth === 0 && (ch === '*' || ch === '/')) {
        parts.push({ op: currentOp, val: expr.slice(lastIdx, i).trim() });
        currentOp = ch as '*' | '/';
        lastIdx = i + 1;
      }
    }
  }

  if (lastIdx < expr.length) {
    parts.push({ op: currentOp, val: expr.slice(lastIdx).trim() });
  }

  return parts.length > 1 ? parts : [];
}

// ============================================================================
// Formatting Utility
// ============================================================================

export function formatCellValue(value: string | number, format?: CellFormat): string {
  if (value === undefined || value === null) return '';
  if (typeof value === 'number' || (!isNaN(Number(value)) && String(value).trim() !== '')) {
    const num = typeof value === 'number' ? value : Number(value);
    if (isNaN(num)) return String(value);

    const dec = format?.decimals !== undefined ? format.decimals : 2;

    switch (format?.numFormat) {
      case 'currency':
        return `$${num.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })}`;
      case 'percent':
        return `${(num * 100).toFixed(dec)}%`;
      case 'integer':
        return Math.round(num).toLocaleString();
      case 'number':
        return num.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec });
      default:
        return typeof value === 'number' ? (Number.isInteger(value) ? String(value) : value.toFixed(dec)) : String(value);
    }
  }
  return String(value);
}

// ============================================================================
// CSV and XLSX Parser Functions
// ============================================================================

export function parseSpreadsheetBuffer(buffer: Uint8Array | ArrayBuffer, _filename?: string): SpreadsheetSheet[] {
  // 1. Primary SheetJS Engine (.xlsx, .xls, .csv, .tsv, .ods, .xlsb)
  try {
    const data = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const workbook = XLSX.read(data, {
      type: 'array',
      cellDates: true,
      cellNF: true,
      raw: false,
    });

    const sheets: SpreadsheetSheet[] = [];
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false,
      });

      const rows: string[][] = rawRows
        .map((r) =>
          Array.isArray(r)
            ? r.map((c) => (c !== null && c !== undefined ? String(c).trim() : ''))
            : []
        )
        .filter((r) => r.some((c) => c !== ''));

      sheets.push({
        name: sheetName || 'Sheet1',
        rows: rows.length > 0 ? rows : [['']],
      });
    }

    if (sheets.length > 0) return sheets;
  } catch (err) {
    console.warn('XLSX primary parsing failed, trying fallbacks:', err);
  }

  // 2. Fallback: HTML table disguised as .xls or text CSV
  try {
    const text = new TextDecoder('utf-8').decode(buffer);
    if (text.includes('<table') || text.includes('<TABLE')) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const tableRows = doc.querySelectorAll('tr');
      const rows: string[][] = [];
      tableRows.forEach((tr) => {
        const cells: string[] = [];
        tr.querySelectorAll('td, th').forEach((td) => {
          cells.push(td.textContent?.trim() || '');
        });
        if (cells.some((c) => c !== '')) rows.push(cells);
      });
      if (rows.length > 0) {
        return [{ name: 'Sheet1', rows }];
      }
    }

    const csvRows = parseCSV(text);
    if (csvRows.length > 0 && csvRows.some((r) => r.some((c) => c !== ''))) {
      return [{ name: 'Sheet1', rows: csvRows }];
    }
  } catch (textErr) {
    console.warn('Fallback text decode failed:', textErr);
  }

  return [{ name: 'Sheet1', rows: [['Unable to parse spreadsheet file.']] }];
}

export function parseXLSXBuffer(buffer: Uint8Array | ArrayBuffer): SpreadsheetSheet[] {
  return parseSpreadsheetBuffer(buffer);
}

export function parseCSV(csvText: string): string[][] {
  if (!csvText || typeof csvText !== 'string') return [['']];

  // 1. SheetJS CSV parsing
  try {
    const workbook = XLSX.read(csvText, { type: 'string', raw: false });
    const firstSheetName = workbook.SheetNames[0];
    if (firstSheetName && workbook.Sheets[firstSheetName]) {
      const rawRows: any[][] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
        header: 1,
        raw: false,
        defval: '',
        blankrows: false,
      });

      const rows: string[][] = rawRows
        .map((r) =>
          Array.isArray(r)
            ? r.map((c) => (c !== null && c !== undefined ? String(c).trim() : ''))
            : []
        )
        .filter((r) => r.some((c) => c !== ''));

      if (rows.length > 0) return rows;
    }
  } catch {}

  // 2. Pure Lexer Fallback
  const cleanText = csvText.replace(/^\uFEFF/, '');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let insideQuotes = false;

  const firstLine = cleanText.slice(0, 1000).split('\n')[0] || '';
  const delimiter = firstLine.includes('\t') ? '\t' : firstLine.includes(';') ? ';' : ',';

  for (let i = 0; i < cleanText.length; i++) {
    const ch = cleanText[i];
    const nextCh = cleanText[i + 1];

    if (insideQuotes) {
      if (ch === '"') {
        if (nextCh === '"') {
          currentVal += '"';
          i++;
        } else {
          insideQuotes = false;
        }
      } else {
        currentVal += ch;
      }
    } else {
      if (ch === '"') {
        insideQuotes = true;
      } else if (ch === delimiter) {
        currentRow.push(currentVal.trim());
        currentVal = '';
      } else if (ch === '\r') {
        if (nextCh === '\n') i++;
        currentRow.push(currentVal.trim());
        if (currentRow.some((c) => c !== '')) rows.push(currentRow);
        currentRow = [];
        currentVal = '';
      } else if (ch === '\n') {
        currentRow.push(currentVal.trim());
        if (currentRow.some((c) => c !== '')) rows.push(currentRow);
        currentRow = [];
        currentVal = '';
      } else {
        currentVal += ch;
      }
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c !== '')) rows.push(currentRow);
  }

  return rows.length > 0 ? rows : [['']];
}

// ============================================================================
// Dynamic Interactive Charts Engine (Bar, Line, Pie)
// ============================================================================

export interface SpreadsheetChartProps {
  rows: string[][];
  sheetName: string;
  onClose?: () => void;
}

export const SpreadsheetChartViewer: React.FC<SpreadsheetChartProps> = ({ rows, sheetName, onClose }) => {
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');
  const [chartTitle, setChartTitle] = useState(`${sheetName} Chart`);
  const [labelColIdx, setLabelColIdx] = useState<number>(0);
  const [selectedValCols, setSelectedValCols] = useState<number[]>([1]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const headerRow = rows[0] || [];
  const bodyRows = rows.slice(1);
  const colCount = Math.max(1, headerRow.length);

  // Auto-detect columns on mount
  useEffect(() => {
    if (headerRow.length > 1) {
      setLabelColIdx(0);
      setSelectedValCols([1]);
    }
  }, [rows]);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const seriesData: { name: string; values: number[] }[] = selectedValCols.map((cIdx) => ({
      name: headerRow[cIdx] || `Col ${colIndexToLetter(cIdx)}`,
      values: [],
    }));

    bodyRows.forEach((row) => {
      const label = row[labelColIdx] || '';
      labels.push(label);
      selectedValCols.forEach((cIdx, sIdx) => {
        const raw = row[cIdx] || '0';
        const num = Number(raw.replace(/[$,%]/g, ''));
        seriesData[sIdx].values.push(isNaN(num) ? 0 : num);
      });
    });

    return { labels, seriesData };
  }, [bodyRows, headerRow, labelColIdx, selectedValCols]);

  // Render chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 680;
    const height = rect.height || 360;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#1c1410';
    ctx.fillRect(0, 0, width, height);

    // Chart Palette (Vintage Leatherbound Gold, Burgundy, Emerald, Azure, Amber)
    const PALETTE = ['#d4b378', '#e06c75', '#98c379', '#61afef', '#e5c07b', '#c678dd', '#56b6c2'];

    const labels = chartData.labels.slice(0, 30);
    const series = chartData.seriesData;

    if (labels.length === 0 || series.length === 0) {
      ctx.fillStyle = '#b8935a';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No numerical data to display in chart', width / 2, height / 2);
      return;
    }

    if (chartType === 'pie') {
      // ----------------- Pie Chart -----------------
      const firstSeries = series[0] || { values: [] };
      const values = firstSeries.values.slice(0, labels.length);
      const total = values.reduce((a, b) => a + Math.max(0, b), 0);

      const centerX = width * 0.4;
      const centerY = height * 0.52;
      const radius = Math.min(width * 0.3, height * 0.36);

      if (total <= 0) {
        ctx.fillStyle = '#b8935a';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Values sum to 0', width / 2, height / 2);
        return;
      }

      let currentAngle = -Math.PI / 2;
      values.forEach((val, i) => {
        if (val <= 0) return;
        const sliceAngle = (val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = PALETTE[i % PALETTE.length];
        ctx.fill();
        ctx.strokeStyle = '#1c1410';
        ctx.lineWidth = 2;
        ctx.stroke();

        currentAngle += sliceAngle;
      });

      // Pie Legend
      const legendX = width * 0.72;
      let legendY = 60;
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'left';
      labels.forEach((lbl, i) => {
        if (i >= 10) return;
        const val = values[i] || 0;
        const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
        ctx.fillStyle = PALETTE[i % PALETTE.length];
        ctx.fillRect(legendX, legendY - 10, 12, 12);
        ctx.fillStyle = '#f4edde';
        ctx.fillText(`${lbl || `Item ${i + 1}`}: ${pct}% (${val})`, legendX + 18, legendY);
        legendY += 22;
      });

    } else if (chartType === 'line') {
      // ----------------- Line Chart -----------------
      const padLeft = 60;
      const padRight = 30;
      const padTop = 40;
      const padBottom = 50;
      const plotWidth = width - padLeft - padRight;
      const plotHeight = height - padTop - padBottom;

      // Find max value
      let maxVal = 0;
      series.forEach((s) => {
        s.values.forEach((v) => {
          if (v > maxVal) maxVal = v;
        });
      });
      maxVal = maxVal > 0 ? maxVal * 1.15 : 10;

      // Gridlines & Y Axis Ticks
      ctx.strokeStyle = 'rgba(184, 147, 90, 0.2)';
      ctx.fillStyle = '#b8935a';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';

      const ticks = 5;
      for (let t = 0; t <= ticks; t++) {
        const yVal = (maxVal / ticks) * t;
        const yPos = padTop + plotHeight - (t / ticks) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(width - padRight, yPos);
        ctx.stroke();
        ctx.fillText(yVal >= 1000 ? `${(yVal / 1000).toFixed(1)}k` : yVal.toFixed(0), padLeft - 8, yPos + 4);
      }

      // X Axis labels
      const stepX = labels.length > 1 ? plotWidth / (labels.length - 1) : plotWidth / 2;
      ctx.textAlign = 'center';
      labels.forEach((lbl, i) => {
        const xPos = padLeft + i * stepX;
        ctx.fillText((lbl || '').slice(0, 8), xPos, height - padBottom + 18);
      });

      // Plot Series Lines
      series.forEach((s, sIdx) => {
        const color = PALETTE[sIdx % PALETTE.length];
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();

        s.values.slice(0, labels.length).forEach((val, i) => {
          const xPos = padLeft + i * stepX;
          const yPos = padTop + plotHeight - (Math.max(0, val) / maxVal) * plotHeight;
          if (i === 0) ctx.moveTo(xPos, yPos);
          else ctx.lineTo(xPos, yPos);
        });
        ctx.stroke();

        // Data point circles
        ctx.fillStyle = color;
        s.values.slice(0, labels.length).forEach((val, i) => {
          const xPos = padLeft + i * stepX;
          const yPos = padTop + plotHeight - (Math.max(0, val) / maxVal) * plotHeight;
          ctx.beginPath();
          ctx.arc(xPos, yPos, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      });

    } else {
      // ----------------- Bar Chart -----------------
      const padLeft = 60;
      const padRight = 30;
      const padTop = 40;
      const padBottom = 50;
      const plotWidth = width - padLeft - padRight;
      const plotHeight = height - padTop - padBottom;

      let maxVal = 0;
      series.forEach((s) => {
        s.values.forEach((v) => {
          if (v > maxVal) maxVal = v;
        });
      });
      maxVal = maxVal > 0 ? maxVal * 1.15 : 10;

      // Gridlines & Y Axis Ticks
      ctx.strokeStyle = 'rgba(184, 147, 90, 0.2)';
      ctx.fillStyle = '#b8935a';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'right';

      const ticks = 5;
      for (let t = 0; t <= ticks; t++) {
        const yVal = (maxVal / ticks) * t;
        const yPos = padTop + plotHeight - (t / ticks) * plotHeight;
        ctx.beginPath();
        ctx.moveTo(padLeft, yPos);
        ctx.lineTo(width - padRight, yPos);
        ctx.stroke();
        ctx.fillText(yVal >= 1000 ? `${(yVal / 1000).toFixed(1)}k` : yVal.toFixed(0), padLeft - 8, yPos + 4);
      }

      // X Bars
      const groupWidth = plotWidth / labels.length;
      const barWidth = Math.max(4, (groupWidth * 0.7) / series.length);

      labels.forEach((lbl, i) => {
        const groupX = padLeft + i * groupWidth;
        series.forEach((s, sIdx) => {
          const val = s.values[i] || 0;
          const barHeight = (Math.max(0, val) / maxVal) * plotHeight;
          const barX = groupX + (groupWidth * 0.15) + sIdx * barWidth;
          const barY = padTop + plotHeight - barHeight;

          ctx.fillStyle = PALETTE[sIdx % PALETTE.length];
          ctx.fillRect(barX, barY, barWidth - 2, barHeight);
        });

        // Label
        ctx.fillStyle = '#b8935a';
        ctx.textAlign = 'center';
        ctx.fillText((lbl || '').slice(0, 8), groupX + groupWidth / 2, height - padBottom + 18);
      });
    }
  }, [chartData, chartType, chartTitle]);

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${chartTitle.replace(/\s+/g, '_').toLowerCase()}.png`;
    a.click();
  };

  return (
    <div className="nb-spreadsheet-chart-modal">
      <div className="nb-chart-toolbar">
        <div className="nb-chart-type-selector">
          <button
            type="button"
            className={`nb-code-btn ${chartType === 'bar' ? 'active' : ''}`}
            onClick={() => setChartType('bar')}
          >
            📊 Bar Chart
          </button>
          <button
            type="button"
            className={`nb-code-btn ${chartType === 'line' ? 'active' : ''}`}
            onClick={() => setChartType('line')}
          >
            📈 Line Chart
          </button>
          <button
            type="button"
            className={`nb-code-btn ${chartType === 'pie' ? 'active' : ''}`}
            onClick={() => setChartType('pie')}
          >
            🥧 Pie Chart
          </button>
        </div>

        <div className="nb-chart-config">
          <label className="nb-chart-label">
            Title:
            <input
              type="text"
              className="nb-chart-select"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              style={{ width: '130px', padding: '4px 8px' }}
            />
          </label>

          <label className="nb-chart-label">
            Labels (X):
            <select
              className="nb-chart-select"
              value={labelColIdx}
              onChange={(e) => setLabelColIdx(Number(e.target.value))}
            >
              {Array.from({ length: colCount }).map((_, c) => (
                <option key={c} value={c}>
                  {colIndexToLetter(c)}: {headerRow[c] || `Column ${c + 1}`}
                </option>
              ))}
            </select>
          </label>

          <label className="nb-chart-label">
            Series (Y):
            <select
              className="nb-chart-select"
              value={selectedValCols[0] || 1}
              onChange={(e) => setSelectedValCols([Number(e.target.value)])}
            >
              {Array.from({ length: colCount }).map((_, c) => (
                <option key={c} value={c}>
                  {colIndexToLetter(c)}: {headerRow[c] || `Column ${c + 1}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="nb-chart-actions">
          <button type="button" className="nb-code-btn" onClick={handleDownloadPNG} title="Save chart image">
            💾 Export PNG
          </button>
          {onClose && (
            <button type="button" className="nb-code-btn" onClick={onClose} title="Back to table">
              ✕ Close
            </button>
          )}
        </div>
      </div>

      <div className="nb-chart-stage">
        <canvas ref={canvasRef} className="nb-chart-canvas" style={{ width: '100%', height: '360px' }} />
      </div>
    </div>
  );
};

// ============================================================================
// Spreadsheet Editor Component
// ============================================================================

export const SpreadsheetEditor: React.FC<SpreadsheetEditorProps> = ({
  data,
  initialCsv,
  fileUrl,
  filename = 'spreadsheet.xlsx',
  readOnly = false,
  onSave,
  onDataChange,
  className = '',
  containerClassName = '',
}) => {
  // State
  const [sheets, setSheets] = useState<SpreadsheetSheet[]>([{ name: 'Sheet1', rows: [['', '', '', ''], ['', '', '', ''], ['', '', '', '']] }]);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [activeCell, setActiveCell] = useState<CellCoord>({ row: 0, col: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [formulaBarValue, setFormulaBarValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid');
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const cellInputRef = useRef<HTMLInputElement | null>(null);
  const tableRef = useRef<HTMLTableElement | null>(null);

  // Load Initial Data
  useEffect(() => {
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray((data as any)[0]?.rows)) {
        setSheets(data as SpreadsheetSheet[]);
      } else if (data.length > 0 && Array.isArray(data[0])) {
        setSheets([{ name: 'Sheet1', rows: data as string[][] }]);
      }
      return;
    }

    if (initialCsv) {
      const parsed = parseCSV(initialCsv);
      setSheets([{ name: 'Sheet1', rows: parsed }]);
      return;
    }

    if (fileUrl) {
      setLoading(true);
      const isXlsx = /\.(xlsx|xls)$/i.test(filename) || /\.(xlsx|xls)$/i.test(fileUrl);

      if (isXlsx) {
        fetch(fileUrl)
          .then((res) => res.arrayBuffer())
          .then((buf) => {
            const parsedSheets = parseXLSXBuffer(new Uint8Array(buf));
            setSheets(parsedSheets);
          })
          .catch((err) => {
            setSheets([{ name: 'Error', rows: [[`Failed to load sheet: ${err.message}`]] }]);
          })
          .finally(() => setLoading(false));
      } else {
        fetch(fileUrl)
          .then((res) => res.text())
          .then((txt) => {
            const parsed = parseCSV(txt);
            setSheets([{ name: 'Sheet1', rows: parsed }]);
          })
          .catch((err) => {
            setSheets([{ name: 'Error', rows: [[`Failed to load file: ${err.message}`]] }]);
          })
          .finally(() => setLoading(false));
      }
    }
  }, [data, initialCsv, fileUrl, filename]);

  const currentSheet = sheets[activeSheetIdx] || sheets[0] || { name: 'Sheet1', rows: [['']] };
  const allRows = currentSheet.rows || [['']];
  const currentFormats = currentSheet.formats || {};

  // Compute number of columns (at least 6 for rich editing experience)
  const maxCols = useMemo(() => {
    let max = 6;
    for (const r of allRows) {
      if (r.length > max) max = r.length;
    }
    return max;
  }, [allRows]);

  // Synchronize formula bar with active cell
  useEffect(() => {
    const rawVal = getRawCellValue(activeCell.row, activeCell.col, allRows);
    setFormulaBarValue(rawVal);
    if (!isEditing) {
      setEditValue(rawVal);
    }
  }, [activeCell, allRows, isEditing]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && cellInputRef.current) {
      cellInputRef.current.focus();
      cellInputRef.current.select();
    }
  }, [isEditing]);

  // Commit Cell Change
  const commitCellChange = useCallback(
    (newVal: string, targetRow = activeCell.row, targetCol = activeCell.col) => {
      setSheets((prevSheets) => {
        const nextSheets = [...prevSheets];
        const s = { ...nextSheets[activeSheetIdx] };
        const rows = s.rows.map((r) => [...r]);

        // Expand rows if needed
        while (rows.length <= targetRow) {
          rows.push(Array.from({ length: maxCols }, () => ''));
        }

        // Expand cols in row if needed
        while (rows[targetRow].length <= targetCol) {
          rows[targetRow].push('');
        }

        rows[targetRow][targetCol] = newVal;
        s.rows = rows;
        nextSheets[activeSheetIdx] = s;

        onDataChange?.(nextSheets);
        return nextSheets;
      });

      setIsEditing(false);
    },
    [activeCell, activeSheetIdx, maxCols, onDataChange]
  );

  // Apply Formatting to Active Cell
  const applyFormat = useCallback(
    (formatPatch: Partial<CellFormat>) => {
      if (readOnly) return;
      const key = getCellKey(activeCell.row, activeCell.col);

      setSheets((prevSheets) => {
        const nextSheets = [...prevSheets];
        const s = { ...nextSheets[activeSheetIdx] };
        const formats = { ...(s.formats || {}) };
        const currentFmt = formats[key] || {};

        formats[key] = { ...currentFmt, ...formatPatch };
        s.formats = formats;
        nextSheets[activeSheetIdx] = s;

        onDataChange?.(nextSheets);
        return nextSheets;
      });
    },
    [activeCell, activeSheetIdx, onDataChange, readOnly]
  );

  // Insert Quick Formulas (SUM, AVERAGE, COUNT, MIN, MAX)
  const insertFormula = useCallback(
    (fnName: string) => {
      if (readOnly) return;
      const aboveRange = activeCell.row > 0 ? `A1:${coordToA1(activeCell.row - 1, activeCell.col)}` : 'A1:A1';
      const formula = `=${fnName}(${aboveRange})`;
      commitCellChange(formula);
    },
    [activeCell, commitCellChange, readOnly]
  );

  // Row and Column Mutations
  const addRow = useCallback(
    (afterIndex = activeCell.row) => {
      if (readOnly) return;
      setSheets((prev) => {
        const next = [...prev];
        const s = { ...next[activeSheetIdx] };
        const rows = [...s.rows];
        const newRow = Array.from({ length: maxCols }, () => '');
        rows.splice(afterIndex + 1, 0, newRow);
        s.rows = rows;
        next[activeSheetIdx] = s;
        onDataChange?.(next);
        return next;
      });
    },
    [activeCell.row, activeSheetIdx, maxCols, onDataChange, readOnly]
  );

  const deleteRow = useCallback(
    (rowIndex = activeCell.row) => {
      if (readOnly || allRows.length <= 1) return;
      setSheets((prev) => {
        const next = [...prev];
        const s = { ...next[activeSheetIdx] };
        const rows = s.rows.filter((_, idx) => idx !== rowIndex);
        s.rows = rows;
        next[activeSheetIdx] = s;
        onDataChange?.(next);
        return next;
      });
      setActiveCell((c) => ({ ...c, row: Math.max(0, c.row - 1) }));
    },
    [activeCell.row, activeSheetIdx, allRows.length, onDataChange, readOnly]
  );

  const addColumn = useCallback(
    (afterCol = activeCell.col) => {
      if (readOnly) return;
      setSheets((prev) => {
        const next = [...prev];
        const s = { ...next[activeSheetIdx] };
        const rows = s.rows.map((r) => {
          const nr = [...r];
          nr.splice(afterCol + 1, 0, '');
          return nr;
        });
        s.rows = rows;
        next[activeSheetIdx] = s;
        onDataChange?.(next);
        return next;
      });
    },
    [activeCell.col, activeSheetIdx, onDataChange, readOnly]
  );

  const deleteColumn = useCallback(
    (colIndex = activeCell.col) => {
      if (readOnly || maxCols <= 1) return;
      setSheets((prev) => {
        const next = [...prev];
        const s = { ...next[activeSheetIdx] };
        const rows = s.rows.map((r) => r.filter((_, idx) => idx !== colIndex));
        s.rows = rows;
        next[activeSheetIdx] = s;
        onDataChange?.(next);
        return next;
      });
      setActiveCell((c) => ({ ...c, col: Math.max(0, c.col - 1) }));
    },
    [activeCell.col, activeSheetIdx, maxCols, onDataChange, readOnly]
  );

  // Keyboard navigation on grid
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isEditing) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitCellChange(editValue);
        setActiveCell((c) => ({ ...c, row: Math.min(allRows.length - 1, c.row + 1) }));
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitCellChange(editValue);
        setActiveCell((c) => ({ ...c, col: Math.min(maxCols - 1, c.col + 1) }));
      } else if (e.key === 'Escape') {
        setIsEditing(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setActiveCell((c) => ({ ...c, row: Math.max(0, c.row - 1) }));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveCell((c) => ({ ...c, row: Math.min(allRows.length - 1, c.row + 1) }));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setActiveCell((c) => ({ ...c, col: Math.max(0, c.col - 1) }));
        break;
      case 'ArrowRight':
        e.preventDefault();
        setActiveCell((c) => ({ ...c, col: Math.min(maxCols - 1, c.col + 1) }));
        break;
      case 'Enter':
      case 'F2':
        e.preventDefault();
        if (!readOnly) setIsEditing(true);
        break;
      case 'Delete':
      case 'Backspace':
        if (!readOnly) {
          commitCellChange('');
        }
        break;
      default:
        // If user starts typing alphanumeric or '=' character
        if (!readOnly && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          setIsEditing(true);
          setEditValue(e.key);
        }
        break;
    }
  };

  // Save changes handler
  const handleSave = () => {
    setSaveStatus('saving');
    onSave?.(sheets);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 400);
  };

  // Export handlers
  const handleDownloadCSV = () => {
    const csvStr = allRows
      .map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentSheet.name || 'sheet'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(sheets, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename.replace(/\.[^/.]+$/, '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFormat = currentFormats[getCellKey(activeCell.row, activeCell.col)] || {};

  return (
    <div
      className={`nb-document-viewer nb-spreadsheet-container ${containerClassName}`}
      data-filename={filename}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {/* 1. Header Toolbar */}
      <div className="nb-spreadsheet-header">
        <div className="nb-spreadsheet-title">
          <span className="nb-doc-icon">📊</span>
          <span className="nb-doc-filename" title={filename}>
            {filename}
          </span>
          <span className="nb-spreadsheet-rowcount">
            {allRows.length} rows • {maxCols} cols
          </span>
        </div>

        <div className="nb-spreadsheet-actions">
          <input
            type="text"
            className="nb-spreadsheet-search"
            placeholder="Search cells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <button
            type="button"
            className={`nb-code-btn ${viewMode === 'chart' ? 'active' : ''}`}
            onClick={() => setViewMode(viewMode === 'grid' ? 'chart' : 'grid')}
            title="Generate dynamic charts"
          >
            {viewMode === 'chart' ? '📋 View Table' : '📈 Charts'}
          </button>

          {!readOnly && onSave && (
            <button
              type="button"
              className="nb-code-btn nb-spreadsheet-save-btn"
              onClick={handleSave}
              title="Save to vault"
            >
              {saveStatus === 'saving' ? '⏳ Saving...' : saveStatus === 'saved' ? '✓ Saved' : '💾 Save'}
            </button>
          )}

          <button
            type="button"
            className="nb-code-btn"
            onClick={handleDownloadCSV}
            title="Download CSV"
          >
            ⬇️ CSV
          </button>
          <button
            type="button"
            className="nb-code-btn"
            onClick={handleDownloadJSON}
            title="Export JSON"
          >
            ⬇️ JSON
          </button>
        </div>
      </div>

      {/* 2. Cell Formatting Toolbar (When in Grid Mode) */}
      {viewMode === 'grid' && !readOnly && (
        <div className="nb-spreadsheet-format-toolbar">
          <div className="nb-format-group">
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.bold ? 'active' : ''}`}
              onClick={() => applyFormat({ bold: !activeFormat.bold })}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.italic ? 'active' : ''}`}
              onClick={() => applyFormat({ italic: !activeFormat.italic })}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.underline ? 'active' : ''}`}
              onClick={() => applyFormat({ underline: !activeFormat.underline })}
              title="Underline"
            >
              <u>U</u>
            </button>
          </div>

          <div className="nb-format-group">
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.align === 'left' ? 'active' : ''}`}
              onClick={() => applyFormat({ align: 'left' })}
              title="Align Left"
            >
              ⇤
            </button>
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.align === 'center' ? 'active' : ''}`}
              onClick={() => applyFormat({ align: 'center' })}
              title="Align Center"
            >
              ↔
            </button>
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.align === 'right' ? 'active' : ''}`}
              onClick={() => applyFormat({ align: 'right' })}
              title="Align Right"
            >
              ⇥
            </button>
          </div>

          <div className="nb-format-group">
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.numFormat === 'currency' ? 'active' : ''}`}
              onClick={() => applyFormat({ numFormat: activeFormat.numFormat === 'currency' ? 'general' : 'currency' })}
              title="Currency ($)"
            >
              $
            </button>
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.numFormat === 'percent' ? 'active' : ''}`}
              onClick={() => applyFormat({ numFormat: activeFormat.numFormat === 'percent' ? 'general' : 'percent' })}
              title="Percentage (%)"
            >
              %
            </button>
            <button
              type="button"
              className={`nb-fmt-btn ${activeFormat.numFormat === 'number' ? 'active' : ''}`}
              onClick={() => applyFormat({ numFormat: activeFormat.numFormat === 'number' ? 'general' : 'number' })}
              title="Comma Separator (,)"
            >
              ,
            </button>
          </div>

          <div className="nb-format-group">
            <select
              className="nb-fmt-select"
              title="Quick formula"
              onChange={(e) => {
                if (e.target.value) {
                  insertFormula(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">∑ Formula...</option>
              <option value="SUM">∑ SUM</option>
              <option value="AVERAGE">AVG AVERAGE</option>
              <option value="COUNT"># COUNT</option>
              <option value="MIN">▼ MIN</option>
              <option value="MAX">▲ MAX</option>
              <option value="PRODUCT">✕ PRODUCT</option>
            </select>
          </div>

          <div className="nb-format-group">
            <button type="button" className="nb-fmt-btn" onClick={() => addRow()} title="Add Row Below">
              + Row
            </button>
            <button type="button" className="nb-fmt-btn" onClick={() => deleteRow()} title="Delete Row">
              - Row
            </button>
            <button type="button" className="nb-fmt-btn" onClick={() => addColumn()} title="Add Column Right">
              + Col
            </button>
            <button type="button" className="nb-fmt-btn" onClick={() => deleteColumn()} title="Delete Column">
              - Col
            </button>
          </div>
        </div>
      )}

      {/* 3. Formula Bar */}
      {viewMode === 'grid' && (
        <div className="nb-spreadsheet-formula-bar">
          <div className="nb-formula-cell-coord">{coordToA1(activeCell.row, activeCell.col)}</div>
          <div className="nb-formula-fx">fx</div>
          <input
            type="text"
            className="nb-formula-input"
            value={formulaBarValue}
            readOnly={readOnly}
            placeholder="Type value or formula (=SUM(A1:A5))..."
            onChange={(e) => {
              setFormulaBarValue(e.target.value);
              setEditValue(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                commitCellChange(formulaBarValue);
              }
            }}
            onBlur={() => {
              if (formulaBarValue !== getRawCellValue(activeCell.row, activeCell.col, allRows)) {
                commitCellChange(formulaBarValue);
              }
            }}
          />
        </div>
      )}

      {/* 4. Sheet Tabs */}
      {sheets.length > 0 && (
        <div className="nb-spreadsheet-tabs">
          {sheets.map((s, idx) => (
            <button
              key={idx}
              type="button"
              className={`nb-spreadsheet-tab ${idx === activeSheetIdx ? 'active' : ''}`}
              onClick={() => setActiveSheetIdx(idx)}
            >
              📄 {s.name || `Sheet${idx + 1}`}
            </button>
          ))}
          {!readOnly && (
            <button
              type="button"
              className="nb-spreadsheet-tab-add"
              onClick={() => {
                const newSheetName = `Sheet${sheets.length + 1}`;
                setSheets((prev) => [
                  ...prev,
                  { name: newSheetName, rows: [['', '', '', ''], ['', '', '', ''], ['', '', '', '']] },
                ]);
                setActiveSheetIdx(sheets.length);
              }}
              title="Add New Sheet"
            >
              +
            </button>
          )}
        </div>
      )}

      {/* 5. Main Content Area (Grid or Chart) */}
      {viewMode === 'chart' ? (
        <SpreadsheetChartViewer
          rows={allRows}
          sheetName={currentSheet.name}
          onClose={() => setViewMode('grid')}
        />
      ) : (
        <div className={`nb-spreadsheet-viewport ${className}`}>
          {loading ? (
            <div className="nb-doc-loading">Loading spreadsheet data...</div>
          ) : (
            <table ref={tableRef} className="nb-spreadsheet-table">
              <thead>
                <tr className="nb-spreadsheet-col-letters">
                  <th className="nb-sheet-corner"></th>
                  {Array.from({ length: maxCols }).map((_, cIdx) => (
                    <th
                      key={cIdx}
                      className={`nb-sheet-col-letter ${cIdx === activeCell.col ? 'active-header' : ''}`}
                      onClick={() => setActiveCell({ row: 0, col: cIdx })}
                    >
                      {colIndexToLetter(cIdx)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allRows.map((row, rIdx) => (
                  <tr key={rIdx} className="nb-spreadsheet-row">
                    <td
                      className={`nb-sheet-row-num ${rIdx === activeCell.row ? 'active-header' : ''}`}
                      onClick={() => setActiveCell({ row: rIdx, col: 0 })}
                    >
                      {rIdx + 1}
                    </td>
                    {Array.from({ length: maxCols }).map((_, cIdx) => {
                      const rawVal = row[cIdx] !== undefined ? String(row[cIdx]) : '';
                      const isSelected = activeCell.row === rIdx && activeCell.col === cIdx;
                      const cellFmt = currentFormats[getCellKey(rIdx, cIdx)] || {};

                      // Evaluate formula for display
                      let displayVal = rawVal;
                      if (rawVal.startsWith('=')) {
                        displayVal = String(evaluateFormula(rawVal, allRows));
                      }
                      displayVal = formatCellValue(displayVal, cellFmt);

                      const isMatch =
                        searchQuery.trim() !== '' &&
                        displayVal.toLowerCase().includes(searchQuery.toLowerCase());

                      const cellStyle: React.CSSProperties = {
                        fontWeight: cellFmt.bold ? 'bold' : 'normal',
                        fontStyle: cellFmt.italic ? 'italic' : 'normal',
                        textDecoration: [cellFmt.underline ? 'underline' : '', cellFmt.strike ? 'line-through' : '']
                          .filter(Boolean)
                          .join(' ') || undefined,
                        textAlign: cellFmt.align || 'left',
                        backgroundColor: cellFmt.bgColor || (isMatch ? 'rgba(229, 192, 123, 0.35)' : undefined),
                        color: cellFmt.textColor || undefined,
                      };

                      return (
                        <td
                          key={cIdx}
                          className={`nb-sheet-cell ${isSelected ? 'selected' : ''} ${isMatch ? 'match' : ''}`}
                          style={cellStyle}
                          onClick={() => {
                            setActiveCell({ row: rIdx, col: cIdx });
                          }}
                          onDoubleClick={() => {
                            if (!readOnly) {
                              setIsEditing(true);
                              setEditValue(rawVal);
                            }
                          }}
                        >
                          {isSelected && isEditing ? (
                            <input
                              ref={cellInputRef}
                              type="text"
                              className="nb-cell-inline-input"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => commitCellChange(editValue, rIdx, cIdx)}
                            />
                          ) : (
                            <span className="nb-cell-text">{displayVal || '\u00A0'}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
