import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";

export default function LangSwitcher() {
  const { locale, push, pathname, asPath, query } = useRouter();

  const [anchor, setAnchor] = useState(null);

  const buttonText = useMemo(
    () => (locale === "ru" ? "Русский" : "English"),
    [locale]
  );

  const handleClick = useCallback(
    (event) => setAnchor(event.currentTarget),
    [setAnchor]
  );

  const handleClose = useCallback(() => setAnchor(null), [setAnchor]);

  const handleEnglish = useCallback(() => {
    setAnchor(null);
    push({ pathname, query }, asPath, { locale: "en" });
  }, [pathname, query, asPath, push, setAnchor]);

  const handleRussian = useCallback(() => {
    setAnchor(null);
    push({ pathname, query }, asPath, { locale: "ru" });
  }, [pathname, query, asPath, push, setAnchor]);

  return (
    <>
      <Button onClick={handleClick}>{buttonText}</Button>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        {locale === "en" ? (
          <MenuItem onClick={handleRussian}>Русский</MenuItem>
        ) : null}
        {locale === "ru" ? (
          <MenuItem onClick={handleEnglish}>English</MenuItem>
        ) : null}
      </Menu>
    </>
  );
}
