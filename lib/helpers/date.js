import { format } from "date-fns";
import locale from "date-fns/locale/ru";

export function formatRU(date, dateFormat = "d MMMM yyyy HH:mm", options = {}) {
  return format(date, dateFormat, { ...options, locale });
}

export function formatDate(date, short = false) {
  return short
    ? format(date, "dd.MM H:mm", { locale })
    : format(date, "dd.MM.yyyy H:mm", { locale });
}
