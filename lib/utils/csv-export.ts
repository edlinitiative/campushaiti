/**
 * CSV Export Utilities
 * Generate CSV files from data arrays
 */

export interface CSVColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: any, row: T) => string;
}

export function generateCSV<T>(
  data: T[],
  columns: CSVColumn<T>[]
): string {
  // Create header row
  const headers = columns.map((col) => escapeCSVValue(col.header));
  const headerRow = headers.join(",");

  // Create data rows
  const dataRows = data.map((row) => {
    const values = columns.map((col) => {
      // Get value from row
      let value: any;
      if (typeof col.key === "string" && col.key.includes(".")) {
        // Handle nested keys like "user.name"
        value = getNestedValue(row, col.key);
      } else {
        value = row[col.key as keyof T];
      }

      // Apply formatter if provided
      if (col.formatter) {
        value = col.formatter(value, row);
      }

      // Convert to string and escape
      return escapeCSVValue(String(value ?? ""));
    });

    return values.join(",");
  });

  // Combine header and data rows
  return [headerRow, ...dataRows].join("\n");
}

function escapeCSVValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Format date for CSV export
 */
export function formatDateForCSV(date: Date | null | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

/**
 * Format timestamp for CSV export
 */
export function formatTimestampForCSV(timestamp: any): string {
  if (!timestamp) return "";
  
  // Handle Firestore Timestamp
  if (timestamp.toDate) {
    return formatDateForCSV(timestamp.toDate());
  }
  
  // Handle Date object
  if (timestamp instanceof Date) {
    return formatDateForCSV(timestamp);
  }
  
  // Handle timestamp number
  if (typeof timestamp === "number") {
    return formatDateForCSV(new Date(timestamp));
  }
  
  return "";
}

/**
 * Format currency for CSV export
 */
export function formatCurrencyForCSV(
  amount: number | null | undefined,
  currency: string = "USD"
): string {
  if (amount == null) return "";
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Format boolean for CSV export
 */
export function formatBooleanForCSV(value: boolean | null | undefined): string {
  if (value == null) return "";
  return value ? "Yes" : "No";
}

/**
 * Format array for CSV export
 */
export function formatArrayForCSV(arr: any[] | null | undefined): string {
  if (!arr || arr.length === 0) return "";
  return arr.join("; ");
}
