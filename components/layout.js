import Box from "@mui/material/Box";
import Head from "next/head";
import Header from "./header";
import Footer from "./footer";
import Notifications from "./notifications";
import { useTranslation } from "next-i18next";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/router";

export default function Layout({
  children,
  titleKey,
  title,
  descriptionKey,
  description,
}) {
  const { pathname, locale } = useRouter();
  const { t } = useTranslation();

  const pageTitle = useMemo(() => {
    if (title) {
      return title;
    }
    if (titleKey) {
      return t(titleKey);
    }
    return "Delux SPA";
  }, [t, title, titleKey]);

  const pageDescription = useMemo(() => {
    if (description) {
      return description;
    }
    if (descriptionKey) {
      return []
        .concat(descriptionKey)
        .map((key) => t(key))
        .join(". ");
    } else {
      return pageTitle;
    }
  }, [t, description, descriptionKey, pageTitle]);

  useEffect(() => {
    if (ym) {
      ym(93333884, "hit", document.location.href);
    }
  }, [pathname, locale]);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <meta name="description" content={pageDescription} />
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
