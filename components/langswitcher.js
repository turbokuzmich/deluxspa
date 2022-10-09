import Button from "@mui/material/Button";
import { useCallback } from "react";
import { useRouter } from "next/router";

export default function LangSwitcher() {
  const { locale, push, pathname, asPath, query } = useRouter();

  const handleSwitch = useCallback(() => {
    push({ pathname, query }, asPath, {
      locale: locale === "ru" ? "en" : "ru",
    });
  }, [locale, pathname, query, asPath, push]);

  return (
    <Button onClick={handleSwitch}>
      {locale === "ru" ? "English" : "Русский"}
    </Button>
  );
}
