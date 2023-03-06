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
import Drawer from "@mui/material/Drawer";
import Link from "next/link";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { getAuthState, getUserName } from "../store/slices/auth";
import { setApiLoaded } from "../store/slices/auth";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useState } from "react";
import { isFetching } from "../store/slices/ui";
import { useRouter } from "next/router";

export default function Layout({ children, title = "Панель управления" }) {
  const { push } = useRouter();

  const dispatch = useDispatch();

  const authState = useSelector(getAuthState);
  const showSpinner = useSelector(isFetching);
  const userName = useSelector(getUserName);

  const [isNavigationVisible, setIsNavigationVisible] = useState(false);

  const onApiLoaded = useCallback(() => dispatch(setApiLoaded()), [dispatch]);

  const onNavigationOpen = useCallback(
    () => setIsNavigationVisible(true),
    [setIsNavigationVisible]
  );
  const onNavigationClose = useCallback(
    () => setIsNavigationVisible(false),
    [setIsNavigationVisible]
  );

  const onMainClick = useCallback(() => {
    push("/admin");
    onNavigationClose();
  }, [push, onNavigationClose]);

  const onOrdersClick = useCallback(() => {
    push("/admin/orders");
    onNavigationClose();
  }, [push, onNavigationClose]);

  const onUserClick = useCallback(() => {
    push("/admin/user");
    onNavigationClose();
  }, [push, onNavigationClose]);

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
      <AppBar
        sx={{
          mb: 2,
        }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            disabled={authState !== "authorized"}
            onClick={onNavigationOpen}
          >
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
            <Link href="/admin/user" passHref>
              <IconButton size="large" edge="end" color="inherit">
                <PersonIcon />
              </IconButton>
            </Link>
          ) : null}
        </Toolbar>
      </AppBar>
      <Drawer
        open={isNavigationVisible}
        anchor="left"
        onClose={onNavigationClose}
        sx={{
          justifyContent: "space-between",
        }}
      >
        <MenuList sx={{ flexGrow: 1 }}>
          <MenuItem sx={{ minWidth: 300 }} onClick={onMainClick}>
            <ListItemIcon>
              <AdminPanelSettingsIcon />
            </ListItemIcon>
            <ListItemText>Главная</ListItemText>
          </MenuItem>
          <MenuItem sx={{ minWidth: 300 }} onClick={onOrdersClick}>
            <ListItemIcon>
              <ShoppingCartIcon />
            </ListItemIcon>
            <ListItemText>Заказы</ListItemText>
          </MenuItem>
        </MenuList>
        <Divider />
        <MenuList>
          <MenuItem sx={{ minWidth: 300 }} onClick={onUserClick}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText>{userName}</ListItemText>
          </MenuItem>
        </MenuList>
      </Drawer>
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
  );
}
