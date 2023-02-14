import { patternFormatter } from "react-number-format";
import { phoneFormat } from "../../constants";

export function formatPhone(phone) {
  return patternFormatter(phone, {
    format: phoneFormat,
  });
}
