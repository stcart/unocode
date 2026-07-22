import path from "node:path";
import { AppError } from "../utils/app-error";

const PDF_MIME = "application/pdf";
const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function isAllowedReportExtension(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return ext === ".pdf" || ext === ".docx";
}

export function isAllowedReportMime(mimetype: string): boolean {
  return mimetype === PDF_MIME || mimetype === DOCX_MIME;
}

export function validateReportFileContent(
  buffer: Buffer,
  filename: string
): void {
  const ext = path.extname(filename).toLowerCase();

  if (ext === ".pdf") {
    if (!buffer.subarray(0, 4).equals(Buffer.from("%PDF"))) {
      throw new AppError(400, "Файл не является корректным PDF");
    }
    return;
  }

  if (ext === ".docx") {
    const zipSignature = buffer.subarray(0, 2);
    if (!zipSignature.equals(Buffer.from("PK"))) {
      throw new AppError(400, "Файл не является корректным DOCX");
    }
    return;
  }

  throw new AppError(400, "Допустимы только файлы .docx и .pdf");
}
