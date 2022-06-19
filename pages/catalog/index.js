import { useMemo } from "react";
import Header from "../../components/header";
import Items from "../../components/items";
import Submenu from "../../components/submenu";
import { catalogItems } from "../../constants";
import property from "lodash/property";

export default function CatalogRoot() {
  const allIds = useMemo(() => catalogItems.map(property("id")), []);

  return (
    <>
      <Header />
      <Submenu />
      <Items items={allIds} />
    </>
  );
}
