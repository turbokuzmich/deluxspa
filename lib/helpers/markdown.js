import json2md from "json2md";

const escapeCharacters = new Set([
  "_",
  "*",
  "[",
  "]",
  "(",
  ")",
  "~",
  "`",
  ">",
  "#",
  "+",
  "-",
  "=",
  "|",
  "{",
  "}",
  ".",
  "!",
]);

json2md.converters.spoiler = function (input) {
  return `||${input}||`;
};

json2md.converters.italic = function (input) {
  return `_${input}_`;
};

json2md.converters.bold = function (input) {
  return `*${input}*`;
};

json2md.converters.inline = function (input) {
  return "`" + input + "`";
};

export function escape(string) {
  return string
    .split("")
    .reduce((result, character) => {
      if (character.charCodeAt(0) <= 126 || escapeCharacters.has(character)) {
        return result.concat(`\\${character}`);
      } else {
        return result.concat(character);
      }
    }, [])
    .join("");
}

export default function render(data) {
  return json2md(data);
}
