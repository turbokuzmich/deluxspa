import { i18n } from "next-i18next";
import set from "lodash/set";
import get from "lodash/get";
import { resolve, basename } from "path";
import { readdir as readDirCb, readFile as readFileCb } from "fs";
import { promisify } from "util";

const readFile = promisify(readFileCb);
const readdir = promisify(readDirCb);

async function fillTranslations(translations) {
  const translationsPath = resolve(process.cwd(), "public", "locales");

  const langs = await readdir(translationsPath);

  const languagesData = await Promise.all(
    langs.map(async (lang) => {
      const languagePath = resolve(translationsPath, lang);
      const storesNames = await readdir(languagePath);

      const storesData = await Promise.all(
        storesNames.map(async (storeName) => {
          const storePath = resolve(languagePath, storeName);
          const data = await readFile(storePath, "utf-8");

          try {
            return JSON.parse(data);
          } catch (error) {
            return {};
          }
        })
      );

      return storesNames.reduce(
        (language, storeName, index) =>
          set(language, storeName.replace(/\.json$/, ""), storesData[index]),
        {}
      );
    })
  );

  langs.forEach((lang, index) => {
    set(translations, [lang], languagesData[index]);
  });
}

export default (function () {
  const translations = {};

  fillTranslations(translations);

  function getLanguageTranslations(lang) {
    return i18n ? i18n.getDataByLanguage(lang) : get(translations, lang, {});
  }

  /**
   *
   * @param {String} code
   * @param {'ru' | 'en'} [lang=null]
   * @param {String} [store='common']
   * @returns
   */
  return function (code, lang = null, store = "common") {
    const language = lang === null ? get(i18n, "language", "ru") : lang;
    const translations = getLanguageTranslations(language);

    return get(translations, [store, code], code);
  };
})();
