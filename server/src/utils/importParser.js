import XLSX from "xlsx";
import { PDFParse } from "pdf-parse";
import * as mammothModule from "mammoth";

const mammoth = mammothModule.default || mammothModule;

const normalizeHeader = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "");

const splitStructuredLine = (line, delimiter) => line.split(delimiter).map((item) => item.trim());

const detectLineDelimiter = (line) => {
  if (line.includes("\t")) {
    return "\t";
  }
  if (line.includes("|")) {
    return "|";
  }
  if (line.includes(",")) {
    return ",";
  }
  if (line.includes(";")) {
    return ";";
  }
  return null;
};

const parseTextTable = (rawText) => {
  const lines = String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return [];
  }

  const delimiter = detectLineDelimiter(lines[0]);
  const splitter = delimiter
    ? (line) => splitStructuredLine(line, delimiter)
    : (line) => line.split(/\s{2,}/).map((item) => item.trim()).filter(Boolean);

  const headers = splitter(lines[0]).map((header) => normalizeHeader(header));
  if (!headers.length) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const parts = splitter(line);
    const record = headers.reduce((accumulator, header, index) => {
      accumulator[header] = parts[index] ?? "";
      return accumulator;
    }, {});
    return record;
  }).filter((record) => {
    const filledValues = Object.values(record).filter((value) => String(value ?? "").trim() !== "");
    return filledValues.length >= 2;
  }).map((record) => {
    return headers.reduce((normalizedRecord, header) => {
      normalizedRecord[header] = record[header];
      return normalizedRecord;
    }, {});
  });
};

const parseSpreadsheetBuffer = (buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json(worksheet, { defval: "" }).map((row) =>
    Object.entries(row).reduce((record, [key, value]) => {
      record[normalizeHeader(key)] = typeof value === "string" ? value.trim() : value;
      return record;
    }, {})
  );
};

export const parseImportFile = async (file) => {
  const filename = file?.originalname?.toLowerCase() || "";

  if (filename.endsWith(".xlsx") || filename.endsWith(".xls") || filename.endsWith(".csv")) {
    return parseSpreadsheetBuffer(file.buffer);
  }

  if (filename.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer: file.buffer });
    return parseTextTable(value);
  }

  if (filename.endsWith(".pdf")) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return parseTextTable(result.text);
    } finally {
      await parser.destroy();
    }
  }

  if (filename.endsWith(".txt")) {
    return parseTextTable(file.buffer.toString("utf8"));
  }

  throw new Error("Unsupported file format. Please upload an Excel, CSV, PDF, DOCX, or TXT file.");
};
