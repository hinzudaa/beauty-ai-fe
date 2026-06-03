import { FormatDistanceToken } from "date-fns";
import { mn } from "date-fns/locale";

export const customMnLocale = {
  ...mn,
  formatDistance: (token: FormatDistanceToken, count: number, options?: Record<string, unknown>) => {
    const originalFormat = mn.formatDistance?.(token, count, options);
    // Remove "ойролцоогоор" (approximately) prefix
    return originalFormat.replace("ойролцоогоор ", "");
  },
};
