import { useMemo } from "react";
import Layout from "../../../components/layout";
import Items from "../../../components/items";
import Submenu from "../../../components/submenu";
import Category from "../../../components/category";
import { catalogTree, catalogItems } from "../../../constants";
import get from "lodash/get";
import { useRouter } from "next/router";

export default function CatalogRoot(props) {
  const {
    query: { id },
  } = useRouter();

  const category = useMemo(
    () =>
      catalogTree
        .reduce(
          (categories, category) =>
            categories.concat(
              category,
              ...(category.categories ? category.categories : [])
            ),
          []
        )
        .find((category) => category.id === id),
    [id]
  );

  const items = useMemo(() => get(category, "items", []), [id]);

  return (
    <Layout>
      <>
        <Submenu />
        {category ? (
          <>
            <Category {...category} />
            <Items items={items} />
          </>
        ) : null}
      </>
    </Layout>
  );
}
