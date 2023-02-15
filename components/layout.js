import Box from "@mui/material/Box";
import Head from "next/head";
import Header from "./header";
import Footer from "./footer";
import Notifications from "./notifications";

export default function Layout({ children, title = "Delux SPA" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Notifications />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Header />
        <Box sx={{ flexGrow: 1, flexShrink: 0 }}>{children}</Box>
        <Footer />
      </Box>
    </>
  );
}
