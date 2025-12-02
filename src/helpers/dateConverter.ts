import { parseISO, isValid, formatISO } from "date-fns";

export const convertDateTime = (value: string): Date => {
  if (!value) throw new Error("Date is required");

  // 1. Try default ISO parser
  let parsedDate = parseISO(value);

  // 2. If invalid, try adding ":00"
  if (!isValid(parsedDate) && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    parsedDate = parseISO(value + ":00");
  }

  // 3. If still invalid → try formats like "2025-12-11 09:00"
  if (!isValid(parsedDate)) {
    const replaced = value.replace(" ", "T");
    parsedDate = parseISO(replaced + ":00");
  }

  // 4. Final validation
  if (!isValid(parsedDate)) {
    throw new Error(
      "Invalid date format. Use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ssZ"
    );
  }

  // Convert to full ISO format with Z (UTC)
  return new Date(formatISO(parsedDate));
};

// const convertDateTime = async (date: Date) => {
//   const offset = date.getTimezoneOffset() * 60000;
//   return new Date(date.getTime() + offset);
// };