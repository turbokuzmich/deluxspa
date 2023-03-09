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

class MarkDown {
  parts = [];

  constructor(parts = []) {
    this.parts = parts;
  }

  append(...parts) {
    this.parts.push(...parts);

    return this;
  }

  text(text) {
    return this.append(escape(text));
  }

  space() {
    return this.append(" ");
  }

  bold(text) {
    return this.append("*", escape(text), "*");
  }

  italic(text) {
    return this.append("_", escape(text), "_");
  }

  underline(text) {
    return this.append("__", escape(text), "__");
  }

  strike(text) {
    return this.append("~", escape(text), "~");
  }

  spoiler(text) {
    return this.append("||", escape(text), "||");
  }

  url(url, text) {
    return this.append(
      "[",
      escape(text ? text : url),
      "]",
      "(",
      escape(url),
      ")"
    );
  }

  inline(text) {
    return this.append("`", escape(text), "`");
  }

  newline(count = 1) {
    return this.append(escape("\n".repeat(count)));
  }

  paragraph() {
    return this.newline(2);
  }

  toString() {
    return this.parts.join("");
  }
}

export default function createFormatter() {
  return new MarkDown();
}
