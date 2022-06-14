import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Header from "../../components/header";
import Typography from "@mui/material/Typography";
import A from "@mui/material/Link";
import Link from "next/link";
import Image from "../../components/image";
import Category from "../../components/category";
import Items from "../../components/items";
import Submenu from "../../components/submenu";

export default function CatalogRoot() {
  return (
    <>
      <Header />
      <Submenu />
      <Category />
      <Items />
      <Category />
      <Items />
    </>
  );
}
