import CssBaseline from "@mui/material/CssBaseline";
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
        variants: [
          {
            props: { selected: true },
            style: ({ theme }) => ({
              cursor: "default",
              color: theme.palette.text.primary,
              textDecoration: "none",
            }),
          },
          {
            props: { catalogItem: true },
            style: ({ theme }) => ({
              color: theme.palette.custom.link,
              textDecoration: "none",
              "&:hover": {
                color: theme.palette.text.primary,
              },
            }),
          },
          {
            props: { submenuItem: true },
            style: ({ theme }) => ({
              paddingLeft: theme.spacing(1),
              paddingRight: theme.spacing(1),
              paddingTop: theme.spacing(2),
              paddingBottom: theme.spacing(2),
              "&:hover": {
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
              },
            }),
          },
        ],
        styleOverrides: {
          root: ({ theme }) => ({
            color: theme.palette.custom.link,
            textDecorationColor: "rgba(105, 85, 48, 0.4)",
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
