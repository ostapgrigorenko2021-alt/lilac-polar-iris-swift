function esc(value: string) {
  return value.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">");
}

export function toExcelXml(rows: string[][]) {
  const body = rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          const text = cell ?? "";
          const numeric = /^-?\d+(\.\d+)?$/.test(text);
          const type = numeric ? "Number" : "String";
          return `<Cell><Data ss:Type="${type}">${numeric ? text : esc(text)}</Data></Cell>`;
        })
        .join("");
      return `<Row>${cells}</Row>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="TSIKST"><Table>${body}</Table></Worksheet>
</Workbook>`;
}

export function download(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadExcel(filename: string, rows: string[][]) {
  download(filename, toExcelXml(rows), "application/vnd.ms-excel;charset=utf-8");
}
