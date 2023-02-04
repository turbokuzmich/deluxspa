import { catalogItems } from "./constants.js";

const translations = catalogItems.reduce((translations, item) => {
  const { id, title } = item;

  const translationId = ["catalog", "item", id.replace(/_/g, "-")].join("-");

  return { ...translations, [translationId]: title };
}, {});

console.log(JSON.stringify(translations, null, 2));
