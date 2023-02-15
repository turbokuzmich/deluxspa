import axios from "axios";
import get from "lodash/get";
import set from "lodash/set";
import has from "lodash/has";
import negate from "lodash/negate";
import first from "lodash/first";
import memoize from "lodash/memoize";
import { URLSearchParams } from "url";
import { catalogItems } from "../../constants";
import t from "../helpers/i18n";

const brandName = "Delux SPA";

const hasNot = negate(has);

const getApi = (function () {
  let api = null;
  let requests = null;

  return async function () {
    if (api !== null) {
      return Promise.resolve(api);
    }

    if (requests !== null) {
      return new Promise((resolve) => {
        requests.push(resolve);
      });
    }

    requests = [];

    const unauthorizedApi = axios.create({
      baseURL: process.env.MOY_SKLAD_API_URL,
      headers: {
        "content-type": "application/json",
      },
    });

    const credentials = new Buffer.from(
      `${process.env.MOY_SKLAD_USER}:${process.env.MOY_SKLAD_PASS}`
    ).toString("base64");

    const {
      data: { access_token },
    } = await unauthorizedApi.post("/security/token", undefined, {
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    unauthorizedApi.defaults.headers.common.Authorization = `Bearer ${access_token}`;

    api = unauthorizedApi;

    if (requests !== null) {
      requests.forEach((resolve) => resolve(api));
      requests = [];
    }

    return api;
  };
})();

function withApi(handler) {
  return async function (...args) {
    const api = await getApi();

    return await handler(api, ...args);
  };
}

// https://online.moysklad.ru/app/#good/edit?id=90e20596-a861-11ed-0a80-0777000c9512
// -> 90e20596-a861-11ed-0a80-0777000c9512
const getIdFromUuidHref = memoize((href = "") => {
  const params = new URLSearchParams(get(href.split("?"), 1));

  return params.get("id");
});

const getRussianName = memoize((name) => t(name, "ru"));

const getNormalizedName = memoize((name = "") =>
  name.trim().toLowerCase().replace(/ё/g, "е")
);

// {
//   meta: {
//     href: 'https://online.moysklad.ru/api/remap/1.2/entity/product/90e20eb7-a861-11ed-0a80-0777000c9514',
//     metadataHref: 'https://online.moysklad.ru/api/remap/1.2/entity/product/metadata',
//     type: 'product',
//     mediaType: 'application/json',
//     uuidHref: 'https://online.moysklad.ru/app/#good/edit?id=90e20596-a861-11ed-0a80-0777000c9512'
//   },
//   id: '90e20eb7-a861-11ed-0a80-0777000c9514',
//   accountId: '02ff697c-012c-11ed-0a80-001c00014324',
//   owner: { meta: [Object] },
//   shared: true,
//   group: { meta: [Object] },
//   updated: '2023-02-09 13:07:31.411',
//   name: 'Морозильная камера STINOL',
//   code: '207',
//   externalCode: 'msppB1Iaht05GdQy3QsWT3',
//   archived: false,
//   pathName: 'Лабораторное оборудование',
//   productFolder: { meta: [Object] },
//   useParentVat: true,
//   uom: { meta: [Object] },
//   images: { meta: [Object] },
//   minPrice: { value: 0, currency: [Object] },
//   salePrices: [ [Object] ],
//   buyPrice: { value: 0, currency: [Object] },
//   barcodes: [ [Object] ],
//   paymentItemType: 'GOOD',
//   discountProhibited: false,
//   weight: 0,
//   volume: 0,
//   variantsCount: 0,
//   isSerialTrackable: false,
//   trackingType: 'NOT_TRACKED',
//   files: { meta: [Object] }
// }
export const getProducts = withApi(async function (api) {
  const {
    data: { rows },
  } = await api.get("/entity/product", {
    params: {
      filter: [`pathName~${brandName}`].join(";"),
    },
  });

  const catalogIdsByNames = catalogItems.reduce(
    (ids, { id, title }) => ({
      ...ids,
      [getNormalizedName(getRussianName(title))]: id,
    }),
    {}
  );

  return rows.reduce((products, row) => {
    const name = getNormalizedName(row.name);

    return name in catalogIdsByNames
      ? { ...products, [catalogIdsByNames[name]]: row }
      : products;
  }, {});
});

// meta {
//   href: 'https://online.moysklad.ru/api/remap/1.2/entity/assortment',
//   type: 'assortment',
//   mediaType: 'application/json',
//   size: 294,
//   limit: 1000,
//   offset: 0
// }
export const getAssortment = withApi(async function (api) {
  const {
    data: { meta, rows },
  } = await api.get("/entity/assortment");

  const {
    productsById,
    productsIdsByName,
    productsVariantsIds,
    variantsById,
    volumesByVariansId,
  } = rows.reduce(
    (result, row) => {
      const rowType = get(row, "meta.type");

      if (
        rowType === "product" &&
        get(row, "pathName", "").includes(brandName)
      ) {
        const id = getIdFromUuidHref(get(row, "meta.uuidHref", ""));

        set(result, ["productsById", id], row);
        set(result, ["productsIdsByName", getNormalizedName(row.name)], id);
      }

      if (rowType === "variant") {
        const productId = getIdFromUuidHref(
          get(row, "product.meta.uuidHref", "")
        );

        const characteristic = get(row, ["characteristics", 0], null);

        if (characteristic !== null) {
          set(result, ["volumesByVariansId", row.id], characteristic.value);
        }

        set(result, ["variantsById", row.id], row);

        set(
          result,
          ["productsVariantsIds", productId],
          [...get(result, ["productsVariantsIds", productId], []), row.id]
        );
      }

      return result;
    },
    {
      productsById: {},
      productsIdsByName: {},
      productsVariantsIds: {},
      volumesByVariansId: {},
      variantsById: {},
    }
  );

  return catalogItems.reduce((stock, item) => {
    const name = getNormalizedName(getRussianName(item.title));

    const itemStock = item.variants.list.reduce(
      (stock, variant) => set(stock, variant, null),
      {}
    );

    if (hasNot(productsIdsByName, name)) {
      return set(stock, item.id, itemStock);
    }

    const productId = productsIdsByName[name];
    const product = productsById[productId];

    if (
      item.variants.list.length === 1 &&
      get(productsVariantsIds, productId, []).length === 0
    ) {
      return set(
        stock,
        item.id,
        set(itemStock, first(Object.keys(itemStock)), get(product, "stock", 0))
      );
    }

    return set(
      stock,
      item.id,
      productsVariantsIds[productId].reduce((itemStock, variantId) => {
        const variant = variantsById[variantId];
        const volume = volumesByVariansId[variant.id];

        return has(itemStock, volume)
          ? set(itemStock, volume, get(variant, "stock", 0))
          : itemStock;
      }, itemStock)
    );
  }, {});
});
