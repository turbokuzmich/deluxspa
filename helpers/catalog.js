import _ from "lodash";
import get from "lodash/get";
import memoize from "lodash/memoize";
import property from "lodash/property";
import { auxColors, catalogTree, catalogItems } from "../constants";

export const getCategoriesWithItems = memoize(() => {
  return catalogTree.reduce(
    (categories, category) => [...categories, ...category.categories],
    []
  );
});

export const getCategoryColorById = memoize((id) => {
  const categoriesWithItems = getCategoriesWithItems();
  const index = categoriesWithItems.findIndex((category) => category.id === id);

  if (index > -1) {
    return auxColors[index];
  }
});

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

export const getFlattenCategories = memoize(() =>
  catalogTree.reduce(
    (categories, category) =>
      categories.concat(
        category,
        ...(category.categories ? category.categories : [])
      ),
    []
  )
);

export const getCategoryById = memoize((id) => {
  return getFlattenCategories().find((category) => category.id === id);
});

export const getCategoryParentById = (id) => {
  const category = getCategoryById(id);

  if (!category) {
    return;
  }

  return getCategoryById(category.parent);
};

export const getItemById = memoize((itemId) =>
  catalogItems.find(({ id }) => id === itemId)
);

export const getItemCategoriesById = memoize((id) =>
  getFlattenCategories().reduce(
    (categories, category) =>
      get(category, "items", []).includes(id)
        ? [...categories, category]
        : categories,
    []
  )
);

// FIXME для каждого товара нужно выбрать сопутствующий и
// дописать в constants; сейчас рандомно выбирается 2 товара
export const getItemAuxiliaryItemsIdsById = memoize((itemId) =>
  _(catalogItems)
    .filter(({ id }) => id !== itemId)
    .shuffle()
    .take(2)
    .map(property("id"))
    .value()
);

export const getItemsByCompositionId = memoize((compositionId) =>
  catalogItems.filter(({ composition }) => composition.includes(compositionId))
);

export const getItemFirstPreviewImage = memoize((itemId) => {
  const { variants } = getItemById(itemId);
  const index = variants.list.findIndex((id) =>
    Boolean(variants.byId[id].image)
  );

  return index > -1 ? variants.byId[variants.list[index]].image : null;
});
