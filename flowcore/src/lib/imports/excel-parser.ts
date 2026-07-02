import ExcelJS from "exceljs";

export type ParsedExcelRow = {
  rowNumber: number;
  values: Record<string, string>;
};

export async function parseExcelFile(file: File): Promise<ParsedExcelRow[]> {
  const workbook = new ExcelJS.Workbook();
  const buffer = Buffer.from(await file.arrayBuffer());

  await workbook.xlsx.load(buffer as unknown as ExcelJS.Buffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    throw new Error("Excel 文件缺少工作表。");
  }

  const headerRow = worksheet.getRow(1);
  const headers: string[] = [];

  headerRow.eachCell((cell, columnNumber) => {
    headers[columnNumber] = normalizeCellValue(cell.value);
  });

  if (headers.filter(Boolean).length === 0) {
    throw new Error("Excel 文件缺少表头。");
  }

  const rows: ParsedExcelRow[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values: Record<string, string> = {};

    for (let columnNumber = 1; columnNumber < headers.length; columnNumber += 1) {
      const header = headers[columnNumber];

      if (header) {
        values[header] = normalizeCellValue(row.getCell(columnNumber).value);
      }
    }

    if (Object.values(values).some((value) => value.length > 0)) {
      rows.push({ rowNumber, values });
    }
  });

  return rows;
}

function normalizeCellValue(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") {
      return value.text.trim();
    }

    if ("result" in value) {
      return normalizeCellValue(value.result as ExcelJS.CellValue);
    }

    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText
        .map((part) => part.text)
        .join("")
        .trim();
    }
  }

  return String(value).trim();
}
