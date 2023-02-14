import { format } from "date-fns";

export function formatDate(date, short = false) {
  return short ? format(date, "dd.MM H:mm") : format(date, "dd.MM.yyyy H:mm");
}
