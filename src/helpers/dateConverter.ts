import { parseISO, isValid, formatISO } from "date-fns";

export const convertDateTime = (value: string): Date => {
  if (!value) throw new Error("Date is required");

  // 1. Try default ISO parser
  let parsed = parseISO(value);

  // 2. If invalid, try adding ":00"
  if (!isValid(parsed) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    parsed = parseISO(value + ":00");
  }

  // 3. If still invalid → try formats like "2025-12-11 09:00"
  if (!isValid(parsed)) {
    const replaced = value.replace(" ", "T");
    parsed = parseISO(replaced + ":00");
  }

  // 4. Final validation
  if (!isValid(parsed)) {
    throw new Error(
      "Invalid date format. Use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ssZ"
    );
  }

  // Convert to full ISO format with Z (UTC)
  return new Date(formatISO(parsed));
};