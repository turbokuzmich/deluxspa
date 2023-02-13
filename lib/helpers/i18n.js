import { i18n } from "next-i18next";
import get from "lodash/get";

/**
 *
 * @param {String} code
 * @param {'ru' | 'en'} [lang=null]
 * @param {String} [store='common']
 * @returns
 */
export default function t(code, lang = null, store = "common") {
  const language = lang === null ? i18n.language : lang;

  // i18n не сразу инициализируется
  return i18n
    ? get(i18n.getDataByLanguage(language), [store, code], code)
    : code;
}
