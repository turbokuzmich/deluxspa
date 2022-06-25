import { useMemo } from "react";
import Layout from "../../components/layout";
import Items from "../../components/items";
import Submenu from "../../components/submenu";
import { catalogItems } from "../../constants";
import property from "lodash/property";

export default function CatalogRoot() {
  const allIds = useMemo(() => catalogItems.map(property("id")), []);

  return (
    <Layout>
      <>
        <Submenu />
        <Items items={allIds} />
      </>
    </Layout>
  );
}
