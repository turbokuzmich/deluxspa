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
      },
      custom: {
        link: "#695530",
        attention: "#76581d",
      },
    },
    typography: {
      fontFamily: '"Evolventa", sans-serif',
    },
    components: {
      MuiLink: {
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.custom.link,
            textDecorationColor: Color(theme.palette.custom.link)
              .alpha(0.4)
              .rgb()
              .string(),
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
