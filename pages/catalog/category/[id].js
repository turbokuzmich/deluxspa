import get from "lodash/get";
import { useMemo } from "react";
import Layout from "../../../components/layout";
import Items from "../../../components/items";
import Submenu from "../../../components/submenu";
import Category from "../../../components/category";
import generativeBackground from "../../../helpers/background";
import { useRouter } from "next/router";
import {
  getCategoryById,
  getCategoryColorById,
  getCategoryParentById,
} from "../../../helpers/catalog";

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
              background: generativeBackground(color),
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
                  backgroundColor: "transparent",
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
