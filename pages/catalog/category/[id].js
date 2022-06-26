import { useMemo } from "react";
import Layout from "../../../components/layout";
import Items from "../../../components/items";
import Submenu from "../../../components/submenu";
import Category from "../../../components/category";
import get from "lodash/get";
import { useRouter } from "next/router";
import {
  getCategoryById,
  getCategoryParentById,
} from "../../../helpers/catalog";

export default function CategoryView() {
  const {
    query: { id },
  } = useRouter();

  const category = useMemo(() => getCategoryById(id), [id]);
  const parent = useMemo(() => getCategoryParentById(id), [id]);
  const items = useMemo(() => get(category, "items", []), [id]);

  return (
    <Layout>
      <>
        <Submenu selected={get(parent, "id")} />
        {id ? (
          <>
            <Category {...category} />
            <Items items={items} />
          </>
        ) : null}
      </>
    </Layout>
  );
}
