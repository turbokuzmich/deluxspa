import CssBaseline from "@mui/material/CssBaseline";
import * as Color from "color";
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
        panes: [
          "#c6e3e9",
          "#ffcdb5",
          "#d7f2c9",
          "#c9d7f2",
          "#e4c9f2",
          "#fff7b1",
          "#f9bab9",
        ],
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

export default DeluxSpaApp;
