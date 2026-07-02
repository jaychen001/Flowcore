import ExcelJS from "exceljs";
import type { ImportError } from "./import-types";
import { IMPORT_TEMPLATE_HEADERS, type ImportType } from "./import-types";

export async function buildImportTemplateBuffer(importType: ImportType): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("导入模板");

  worksheet.addRow(IMPORT_TEMPLATE_HEADERS[importType]);
  worksheet.getRow(1).font = { bold: true };
  worksheet.columns = IMPORT_TEMPLATE_HEADERS[importType].map((header) => ({
    header,
    width: Math.max(header.length * 2, 16)
  }));

  return Buffer.from(await workbook.xlsx.writeBuffer());
}

export async function buildErrorReportBuffer(errors: ImportError[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("错误报告");

  worksheet.columns = [
    { header: "行号", key: "rowNumber", width: 10 },
    { header: "字段", key: "field", width: 20 },
    { header: "原因", key: "reason", width: 48 }
  ];
  worksheet.getRow(1).font = { bold: true };

  for (const error of errors) {
    worksheet.addRow(error);
  }

  return Buffer.from(await workbook.xlsx.writeBuffer());
}
