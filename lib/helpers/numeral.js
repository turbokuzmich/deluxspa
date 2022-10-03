const numeral = require("numeral");

numeral.register("locale", "ru", {
  delimiters: {
    thousands: " ",
    decimal: ",",
  },
  abbreviations: {
    thousand: "тыс.",
    million: "млн.",
    billion: "млрд.",
    trillion: "трлн.",
  },
  ordinal() {
    return ".";
  },
  currency: {
    symbol: "₽",
  },
});

numeral.locale("ru");

module.exports = numeral;
