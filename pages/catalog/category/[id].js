import get from "lodash/get";
import { useMemo } from "react";
import Layout from "../../../components/layout";
import Items from "../../../components/items";
import Submenu from "../../../components/submenu";
import Category from "../../../components/category";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import {
  getCategoryById,
  getCategoryColorById,
  getCategoryParentById,
} from "../../../lib/helpers/catalog";

export default function CategoryView({ id }) {
  const { t } = useTranslation();

  const category = useMemo(() => getCategoryById(id), [id]);
  const parent = useMemo(() => getCategoryParentById(id), [id]);
  const color = useMemo(() => getCategoryColorById(id), [id]);
  const items = useMemo(() => get(category, "items", []), [category]);

  return (
    <Layout title={t(category.title)}>
      <Category
        {...category}
        color={color}
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
    </Layout>
  );
}

export async function getServerSideProps({ locale, params: { id } }) {
  return {
    props: {
      id,
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
