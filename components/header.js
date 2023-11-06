import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Logo from "../components/logo";
import Eco from "../components/eco";
import A from "@mui/material/Link";
import Link from "next/link";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import LangSwitcher from "./langswitcher";
import CartLink from "./cartlink";
import AuthLink from "./authlink";
import * as Color from "color";
import { mainMenu } from "../constants";
import { useRouter } from "next/router";
import { useTheme } from "@emotion/react";
import { useCallback, useState, useMemo } from "react";
import { useTranslation } from "next-i18next";

export default function Header() {
  const { t } = useTranslation();
  const { pathname, push } = useRouter();

  const [anchorEl, setAnchorEl] = useState(null);

  const {
    palette: {
      custom: { eco },
    },
  } = useTheme();

  const handleClose = useCallback(() => setAnchorEl(null), [setAnchorEl]);

  const handleClick = useCallback(
    (event) => {
      setAnchorEl(event.currentTarget);
    },
    [setAnchorEl]
  );

  const ecoColor = useMemo(
    () => Color(eco).lighten(0.4).hex().toString(),
    [eco]
  );

  const clickHandlers = useMemo(
    () =>
      mainMenu.reduce(
        (handlers, { link }) => ({
          ...handlers,
          [link]: () => {
            handleClose();
            push(link);
          },
        }),
        {}
      ),
    [handleClose, push]
  );

  return (
    <Box sx={{ backgroundColor: "common.white", flexShrink: 0, flexGrow: 0 }}>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: {
            xs: "space-between",
            md: "flex-start",
          },
          pt: 1,
          pb: 1,
        }}
      >
        <Link href="/" passHref>
          <A sx={{ position: "relative" }}>
            <Logo
              sx={{
                width: {
                  xs: 70,
                  md: 100,
                },
                display: "block",
              }}
            />
            <Eco
              sx={{
                top: 0,
                fill: ecoColor,
                right: -18,
                width: 30,
                position: "absolute",
                transform: "rotate(50deg)",
              }}
            />
          </A>
        </Link>
        <Box
          sx={{
            display: {
              xs: "flex",
              md: "none",
              gap: 10,
            },
          }}
        >
          <LangSwitcher />
          <IconButton edge="start" onClick={handleClick}>
            <MenuIcon
              sx={{
                fontSize: "2rem",
              }}
            />
          </IconButton>
          <CartLink />
          <AuthLink />
        </Box>
        <Menu
          anchorEl={anchorEl}
          open={anchorEl !== null}
          onClose={handleClose}
          sx={{
            "& .MuiPaper-root": {
              minWidth: 200,
            },
            "& .MuiMenuItem-root": {
              fontSize: "1.3rem",
            },
          }}
        >
          {mainMenu
            .filter(({ hidden }) => !hidden)
            .map(({ title, link }) => (
              <MenuItem key={link} onClick={clickHandlers[link]}>
                {t(title)}
              </MenuItem>
            ))}
        </Menu>
        <Box
          sx={{
            ml: 6,
            display: {
              xs: "none",
              md: "flex",
            },
            gap: 2,
          }}
        >
          {mainMenu
            .filter(({ hidden }) => !hidden)
            .map(({ title, link }) => {
              const isSelected = pathname.startsWith(link);

              const styles = {
                position: "relative",
                textTransform: "uppercase",
                "&::before, &::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  height: "2px",
                  backgroundColor: "custom.eco",
                  transition: "left .2s ease-out, right .2s ease-out",
                  left: "50%",
                  right: "50%",
                },
                "&:hover::before": {
                  left: 0,
                },
                "&:hover::after": {
                  right: 0,
                },
                ...(isSelected
                  ? {
                      color: "text.primary",
                      "&::before": {
                        left: 0,
                      },
                      "&::after": {
                        right: 0,
                      },
                    }
                  : {}),
              };

              return (
                <Link key={link} href={link} passHref>
                  <A variant="h6" underline="none" sx={styles}>
                    {t(title)}
                  </A>
                </Link>
              );
            })}
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            justifyContent: "flex-end",
            alignItems: "center",
            display: {
              xs: "none",
              md: "flex",
              gap: 0,
            },
          }}
        >
          <LangSwitcher />
          <CartLink />
          <AuthLink />
        </Box>
      </Container>
    </Box>
  );
}
