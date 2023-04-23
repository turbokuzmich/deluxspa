const flatten = require("lodash/flatten");
const { readFile: readFileCb } = require("fs");
const { parse } = require("acorn");
const { promisify } = require("util");

const readFile = promisify(readFileCb);

module.exports = {
  siteUrl: process.env.SITE_URL_PRODUCTION,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/cart", "/order", "/order/*"],
      },
    ],
  },
  exclude: ["/admin", "/admin/*", "/cart", "/order", "/order/*"],
  async additionalPaths({ priority, changefreq }) {
    const content = await readFile("./constants.js", "utf8");

    const lastmod = new Date().toISOString();
    const ast = parse(content, { sourceType: "module" });

    const treeNode = ast.body.find(
      (node) =>
        node.type === "ExportNamedDeclaration" &&
        node.declaration.declarations[0].id.name === "catalogTree"
    );

    return flatten(
      treeNode.declaration.declarations[0].init.elements.map((element) => {
        const categoriesNode = element.properties.find(
          (property) => property.key.name === "categories"
        );

        const categories = categoriesNode.value.elements.map((element) => {
          const idNode = element.properties.find(
            (property) => property.key.name === "id"
          );
          const itemsNode = element.properties.find(
            (property) => property.key.name === "items"
          );

          return {
            id: idNode.value.value,
            items: itemsNode.value.elements.map((element) => element.value),
          };
        });

        return categories;
      })
    )
      .reduce((links, { id, items }) => {
        return links
          .concat([
            `${process.env.SITE_URL_PRODUCTION}/catalog/category/${id}`,
            `${process.env.SITE_URL_PRODUCTION}/en/catalog/category/${id}`,
          ])
          .concat(
            flatten(
              items.map((item) => [
                `${process.env.SITE_URL_PRODUCTION}/catalog/item/${item}`,
                `${process.env.SITE_URL_PRODUCTION}/en/catalog/item/${item}`,
              ])
            )
          );
      }, [])
      .map((loc) => ({
        loc,
        lastmod,
        changefreq,
        priority,
      }))
      .concat({
        loc: `${process.env.SITE_URL_PRODUCTION}/en/about`,
        lastmod,
        changefreq,
        priority,
      });
  },
};
