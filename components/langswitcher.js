import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useCallback } from "react";
import { useRouter } from "next/router";

export default function LangSwitcher() {
  const { locale, push, pathname, asPath, query } = useRouter();

  const handleSwitch = useCallback(
    (event) => {
      event.preventDefault();

      push({ pathname, query }, asPath, {
        locale: event.target.dataset.lang,
      });
    },
    [pathname, query, asPath, push]
  );

  const selectedSx = useCallback(
    (theme) => ({
      color: theme.palette.custom.eco,
      cursor: "default",
      textDecoration: "none",
      ":hover": {
        color: theme.palette.custom.eco,
      },
    }),
    []
  );

  return (
    <Typography
      sx={{
        mr: 2,
        textTransform: "uppercase",
      }}
    >
      <Link
        data-lang="ru"
        href="/"
        onClick={handleSwitch}
        sx={locale === "ru" ? selectedSx : {}}
      >
        рус
      </Link>{" "}
      /{" "}
      <Link
        href="/en"
        data-lang="en"
        onClick={handleSwitch}
        sx={locale === "en" ? selectedSx : {}}
      >
        eng
      </Link>
    </Typography>
  );
}
