const fs = require("fs");
const path = require("path");
const mjml = require("mjml");
const MjColumn = require("mjml-column");
const MjText = require("mjml-text");
const MjBody = require("mjml-body");
const MjTable = require("mjml-table");
const memoize = require("lodash/memoize");
const property = require("lodash/property");
const template = require("lodash/template");
const { minify } = require("html-minifier-terser");

function getDataProviderComponent(data) {
  return class Body extends MjBody {
    getChildContext() {
      return {
        ...super.getChildContext(),
        templateData: data,
      };
    }
  };
}

class Text extends MjText {
  getContent() {
    const render = template(super.getContent(), { variable: "data" });

    return render(this.context.templateData);
  }
}

class Table extends MjTable {
  getContent() {
    const render = template(super.getContent(), { variable: "data" });

    return render(this.context.templateData);
  }
}

class Column extends MjColumn {
  getStyles() {
    const { parsedWidth, unit } = super.getParsedWidth();
    const width = `${parsedWidth}${unit}`;

    const styles = super.getStyles();

    return {
      ...styles,
      div: {
        ...styles.div,
        width: width,
        "max-width": width,
      },
    };
  }
  render() {
    return super.render();
  }
}

const loadTemplate = memoize((name) =>
  fs.readFileSync(
    path.resolve("./lib/backend/letters/templates", `${name}.mjml`),
    "utf8"
  )
);

export default async function render(name, data) {
  const { html } = mjml(loadTemplate(name), {
    skeleton: property("content"),
    presets: [
      {
        components: [Column, Table, Text, getDataProviderComponent(data)],
        dependencies: {},
      },
    ],
  });

  return await minify(html, {
    collapseWhitespace: true,
    minifyCSS: false,
    caseSensitive: true,
    removeEmptyAttributes: true,
  });
}
