import memoize from "lodash/memoize";
import { catalogTree } from "../constants";

export const getCategoryByPath = memoize(
  (path) => {
    function searcher(path, categories) {
      const normalizedPath = [].concat(path);

      if (normalizedPath.length === 1) {
        return categories.find(({ id }) => id === normalizedPath[0]);
      }

      const categoryId = normalizedPath.shift();
      const category = categories.find(({ id }) => id === categoryId);

      return searcher(normalizedPath, category.categories);
    }

    return searcher(path, catalogTree);
  },
  (path) => path.toString()
);

export const getCategoryById = memoize((id) => {
  return catalogTree
    .reduce(
      (categories, category) =>
        categories.concat(
          category,
          ...(category.categories ? category.categories : [])
        ),
      []
    )
    .find((category) => category.id === id);
});

export const getCategoryParentById = (id) => {
  const category = getCategoryById(id);

  if (!category) {
    return;
  }

  return getCategoryById(category.parent);
};
