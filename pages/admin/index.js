import Script from "next/script";
import Typography from "@mui/material/Typography";
import { useCallback, useState } from "react";
import api from "../../lib/frontend/api";

export default function Admin() {
  const [status, setStatus] = useState("initial");

  const onApiLoaded = useCallback(async () => {
    try {
      await api.post("/admin/auth", {
        data: Telegram.WebApp.initDataUnsafe,
      });

      setStatus("authorized");
    } catch (error) {
      setStatus("unauthorized");
    }
  }, [setStatus]);

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onLoad={onApiLoaded}
      />
      {status === "initial" ? (
        <Typography>Проверяю авторизацию</Typography>
      ) : null}
      {status === "unauthorized" ? (
        <Typography>Вы не имеете права тут находиться</Typography>
      ) : null}
      {status === "authorized" ? (
        <Typography>
          Добро пожаловать, {Telegram.WebApp.initDataUnsafe.user.first_name}
        </Typography>
      ) : null}
    </>
  );
}
