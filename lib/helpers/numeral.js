const numeral = require("numeral");

if (!numeral.locales["ru"]) {
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
}

module.exports = numeral;

module.exports.format = (number) => numeral(number).format("0,0");
