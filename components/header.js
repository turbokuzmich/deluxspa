import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Logo from "../components/logo";
import Eco from "../components/eco";
import A from "@mui/material/Link";
import Link from "next/link";
import * as Color from "color";
import { mainMenu } from "../constants";
import { useRouter } from "next/router";
import { useTheme } from "@emotion/react";
import { useMemo } from "react";

export default function Header() {
  const { pathname } = useRouter();

  const {
    palette: {
      custom: { eco },
    },
  } = useTheme();

  const ecoColor = useMemo(
    () => Color(eco).lighten(0.4).hex().toString(),
    [eco]
  );

  return (
    <Box sx={{ backgroundColor: "common.white", flexShrink: 0, flexGrow: 0 }}>
      <Container
        sx={{
          display: "flex",
          alignItems: "center",
          pt: 1,
          pb: 1,
        }}
      >
        <Link href="/" passHref>
          <A sx={{ position: "relative" }}>
            <Logo
              sx={{
                width: 100,
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
                color: "custom.eco",
                "&::before, &::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  height: "2px",
                  backgroundColor: "text.primary",
                  transition: "left .2s ease-out, right .2s ease-out",
                  left: "50%",
                  right: "50%",
                },
                "&:hover": {
                  color: "text.primary",
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
                    {title}
                  </A>
                </Link>
              );
            })}
        </Box>
      </Container>
    </Box>
  );
}
