import CssBaseline from "@mui/material/CssBaseline";
import * as Color from "color";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";

import "../styles/global.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      background: {
        default: "#f1e3c9",
        paper: "#e3c68e",
        footer: "#2b2a28",
      },
      custom: {
        link: "#695530",
        attention: "#76581d",
        pane2: "#FFC690",
        pane3: "#FFC59B",
        pane4: "#FFC2B1",
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
