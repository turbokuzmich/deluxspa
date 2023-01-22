import CssBaseline from "@mui/material/CssBaseline";
import * as Color from "color";
import { ecoColor, auxColors } from "../constants";
import { appWithTranslation } from "next-i18next";
import reduxWrapper from "../store";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";

import "../styles/global.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const primaryColor = "#695530";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      text: {
        primary: Color("#342e25").lighten(0.8).rgb().toString(),
      },
      primary: {
        main: primaryColor,
      },
      background: {
        default: Color("#f1e3c9").lighten(0.11).rgb().toString(),
        paper: Color("#e3c68e").lighten(0.15).rgb().toString(),
        footer: "#2b2a28",
      },
      custom: {
        link: primaryColor,
        attention: "#76581d",
        eco: ecoColor,
        panes: auxColors,
      },
    },
    typography: {
      fontFamily: '"Evolventa", sans-serif',
    },
    components: {
      MuiPopover: {
        styleOverrides: {
          paper: ({ theme }) => ({
            backgroundColor: theme.palette.background.default,
          }),
        },
      },
      MuiLink: {
        variants: [
          {
            props: { "data-variant": "footer" },
            style: ({ theme }) => ({
              color: theme.palette.common.white,
              textDecorationColor: theme.palette.common.white,
              "&:hover": {
                color: theme.palette.common.white,
                textDecoration: "none",
              },
            }),
          },
        ],
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.custom.link,
            textDecorationColor: Color(theme.palette.custom.link)
              .alpha(0.4)
              .rgb()
              .string(),
            "&:hover": {
              color: theme.palette.text.primary,
            },
          }),
          underlineHover: ({ theme }) => ({
            textDecorationColor: theme.palette.custom.link,
          }),
        },
      },
    },
  })
);

function DeluxSpaApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default reduxWrapper.withRedux(appWithTranslation(DeluxSpaApp));
