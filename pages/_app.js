import CssBaseline from "@mui/material/CssBaseline";
import * as Color from "color";
import { ecoColor, auxColors } from "../constants";
import { appWithTranslation } from "next-i18next";
import { Provider } from "react-redux";
import { usePageVisibility } from "react-page-visibility";
import { useEffect } from "react";
import MapLoader from "../components/maploader";
import ErrorBoundary from "../components/error";
import environmentSlice, { getIsOnline } from "../store/slices/environment";
import noInternet from "no-internet";
import clientReduxWrapper from "../store";
import adminReduxWrapper from "../admin/store";
import {
  createTheme,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import a from "next/router";

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
      secondary: {
        main: Color(primaryColor).lighten(0.6).rgb().toString(),
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

function DeluxSpaClientApp({ Component, ...rest }) {
  const { store, props } = clientReduxWrapper.useWrappedStore(rest);

  const { dispatch } = store;

  const isVisible = usePageVisibility();

  useEffect(() => {
    noInternet({
      callback(isOffline) {
        const isOnline = getIsOnline(store.getState());

        if (isOnline === isOffline) {
          dispatch(environmentSlice.actions.setOnline(!isOffline));
        }
      },
    });

    return function () {
      noInternet.clearInterval();
    };
  }, [dispatch, store]);

  useEffect(() => {
    dispatch(environmentSlice.actions.setVisibility(isVisible));
  }, [isVisible, dispatch]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <MapLoader dispatch={dispatch} />
        <CssBaseline />
        <Provider store={store}>
          <Component {...props.pageProps} />
        </Provider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function DeluxSpaAdminApp({ Component, ...rest }) {
  const { store, props } = adminReduxWrapper.useWrappedStore(rest);

  return (
    <ErrorBoundary>
      <CssBaseline />
      <Provider store={store}>
        <Component {...props.pageProps} />
      </Provider>
    </ErrorBoundary>
  );
}

function DeluxSpaApp(props) {
  const {
    router: { pathname },
  } = props;

  if (pathname.startsWith("/admin")) {
    return <DeluxSpaAdminApp {...props} />;
  } else {
    return <DeluxSpaClientApp {...props} />;
  }
}

export default appWithTranslation(DeluxSpaApp);
