import get from "lodash/get";
import { useMemo } from "react";
import * as Color from "color";
import Layout from "../../../components/layout";
import Items from "../../../components/items";
import Submenu from "../../../components/submenu";
import Category from "../../../components/category";
import { useRouter } from "next/router";
import {
  getCategoryById,
  getCategoryColorById,
  getCategoryParentById,
} from "../../../lib/helpers/catalog";

export default function CategoryView() {
  const {
    query: { id },
  } = useRouter();

  const category = useMemo(() => getCategoryById(id), [id]);
  const parent = useMemo(() => getCategoryParentById(id), [id]);
  const color = useMemo(() => getCategoryColorById(id), [id]);
  const items = useMemo(() => get(category, "items", []), [id]);

  return (
    <Layout>
      {id ? (
        <>
          <Category
            {...category}
            sx={{
              backgroundColor: color,
              position: "relative",
              category: {
                pt: "80px",
              },
            }}
            addonBefore={
              <Submenu
                selected={id}
                parentSelected={get(parent, "id")}
                sx={{
                  backgroundColor: Color(color).alpha(0.8).rgb().toString(),
                  position: "absolute",
                  width: "100%",
                  zIndex: 1,
                  top: 0,
                }}
              />
            }
          />
          <Items items={items} />
        </>
      ) : null}
    </Layout>
  );
}
