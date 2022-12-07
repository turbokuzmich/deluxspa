import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import Script from "next/script";
import Price from "../../components/price";
import { useCallback, useEffect, useState } from "react";

export default function BoxBerry() {
  const [boxberryApiReady, setBoxberryApiReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState(null);

  const onApiLoaded = useCallback(
    () => setBoxberryApiReady(true),
    [setBoxberryApiReady]
  );

  const boxberryCallback = useCallback(
    (point) => setSelectedPoint(point),
    [setSelectedPoint]
  );

  const onBoxberryOpen = useCallback(() => {
    boxberry.open(
      "boxberryCallback",
      "1$BlnaQq8xtErb_CztdD4Bfv5XuFB5CfSk", // FIXME удолить и воспользоваться .local.env
      "",
      "",
      1000,
      500,
      0,
      50,
      50,
      50
    );
  }, []);

  useEffect(() => {
    window.boxberryCallback = boxberryCallback;
  }, [boxberryCallback]);

  return (
    <>
      <Script
        src="http://points.boxberry.ru/js/boxberry.js"
        strategy="afterInteractive"
        onLoad={onApiLoaded}
      />
      <Layout>
        <>
          <Container>
            <Box
              sx={{
                pt: 8,
              }}
            >
              <Typography
                variant="h3"
                sx={{ textTransform: "uppercase" }}
                paragraph
              >
                Калькулятор доставки BoxBerry
              </Typography>
              <Typography paragraph>
                <Button
                  variant="contained"
                  onClick={onBoxberryOpen}
                  disabled={!boxberryApiReady}
                >
                  Выбрать ПВЗ
                </Button>
              </Typography>
              {selectedPoint ? (
                <>
                  <Typography variant="h5" paragraph>
                    Выбранный ПВЗ
                  </Typography>
                  <Typography>Адрес — {selectedPoint.address}</Typography>
                  <Typography>
                    Стоимость — <Price sum={selectedPoint.price} />
                  </Typography>
                </>
              ) : null}
            </Box>
          </Container>
        </>
      </Layout>
    </>
  );
}
