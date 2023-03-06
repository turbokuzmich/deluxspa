import Box from "@mui/material/Box";
import Head from "next/head";
import Script from "next/script";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import Container from "@mui/material/Container";
import { getAuthState, getUserName } from "../store/slices/auth";
import { setApiLoaded } from "../store/slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { isFetching } from "../store/slices/ui";

export default function Layout({ children, title = "Панель управления" }) {
  const dispatch = useDispatch();

  const userName = useSelector(getUserName);
  const authState = useSelector(getAuthState);
  const showSpinner = useSelector(isFetching);

  const onApiLoaded = useCallback(() => dispatch(setApiLoaded()), [dispatch]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={onApiLoaded}
      />
      <>
        <AppBar
          sx={{
            mb: 2,
          }}
        >
          <Toolbar>
            <IconButton size="large" edge="start" color="inherit">
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              {title}
            </Typography>
            {authState === "initial" || authState === "authorizing" ? (
              <CircularProgress />
            ) : null}
            {authState === "unauthorized" ? <LockIcon /> : null}
            {authState === "authorized" ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <PersonIcon />
                <Typography variant="h6">{userName}</Typography>
              </Box>
            ) : null}
          </Toolbar>
        </AppBar>
        {showSpinner ? (
          <Box
            sx={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              backdropFilter: "blur(3px)",
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              position: "absolute",
              zIndex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress sx={{ mt: 12 }} />
          </Box>
        ) : null}
        <Container sx={{ pt: 10 }}>
          {authState === "authorized" ? children : null}
        </Container>
      </>
    </>
  );
}
