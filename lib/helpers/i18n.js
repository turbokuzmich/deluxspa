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
  if (i18n) {
    const language = lang === null ? i18n.language : lang;

    return get(i18n.getDataByLanguage(language), [store, code], code);
  }

  return code;
}
