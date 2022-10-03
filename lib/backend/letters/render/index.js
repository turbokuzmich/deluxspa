const fs = require("fs");
const path = require("path");
const mjml = require("mjml");
const MjColumn = require("mjml-column");
const MjText = require("mjml-text");
const MjBody = require("mjml-body");
const memoize = require("lodash/memoize");
const property = require("lodash/property");
const template = require("lodash/template");

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
  static allowedAttributes = {
    ...MjText.allowedAttributes,
    data: "string",
  };

  getContent() {
    const render = template(super.getContent());

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

export default function render(name, data) {
  const { html } = mjml(loadTemplate(name), {
    skeleton: property("content"),
    presets: [
      {
        components: [Column, Text, getDataProviderComponent(data)],
        dependencies: {},
      },
    ],
  });

  return html;
}
