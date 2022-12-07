import A from "@mui/material/Link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Fragment, useCallback, useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { deliveryCompanies } from "../constants";
import deliverySlice, {
  getDeliveryPoints,
  getDeliveryCityCoordinates,
  getDeliveryPointsStatus,
  isDialogVisible,
} from "../store/slices/delivery";

export default function DeliveryPointsDialog() {
  const dispatch = useDispatch();

  const mapsContainerRef = useRef();
  const map = useRef();

  const deliveryPoints = useSelector(getDeliveryPoints);
  const shouldShowDialog = useSelector(isDialogVisible);
  const deliveryPointsStatus = useSelector(getDeliveryPointsStatus);
  const centerCoordinates = useSelector(getDeliveryCityCoordinates);

  const [selectedPoint, setSelectedPoint] = useState(null);

  const onClose = useCallback(
    () => dispatch(deliverySlice.actions.hideDialog()),
    []
  );

  const onSelected = useCallback(() => {
    dispatch(deliverySlice.actions.setDeliveryPoint(selectedPoint));
    dispatch(deliverySlice.actions.hideDialog());
  }, [selectedPoint]);

  const buildMap = useCallback(() => {
    if (map.current) {
      return;
    }

    map.current = new ymaps.Map(mapsContainerRef.current, {
      center: [centerCoordinates.lat, centerCoordinates.lng],
      zoom: 5,
      controls: ["smallMapDefaultSet"],
    });
  }, [centerCoordinates]);

  const renderPoints = useCallback(() => {
    if (!map.current || map.current.geoObjects.getLength()) {
      return;
    }

    const clusterer = new ymaps.Clusterer({
      groupByCoordinates: false,
      clusterDisableClickZoom: true,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
    });

    clusterer.balloon.events.add(["open", "click"], () => {
      const { cluster } = clusterer.balloon.getData();
      const object = cluster.state.get("activeObject");
      object.events.fire("deluxspa:selected");
    });

    const placemarks = deliveryPoints.map((point) => {
      const placemark = new ymaps.Placemark(
        [point.latitude, point.longitude],
        {
          balloonContentHeader: `${point.name} (${
            deliveryCompanies[point.type].name
          })`,
          balloonContentBody: point.address,
        },
        {
          preset: "islands#circleIcon",
          iconColor: deliveryCompanies[point.type].color,
        }
      );
      placemark.events.add(["click", "deluxspa:selected"], () =>
        setSelectedPoint(point)
      );
      return placemark;
    });

    clusterer.add(placemarks);
    map.current.geoObjects.add(clusterer);
  }, [deliveryPoints, map]);

  useEffect(() => {
    if (shouldShowDialog) {
      buildMap();

      return () => {
        if (map.current) {
          map.current.destroy();
          map.current = null;
        }
      };
    }
  }, [shouldShowDialog, map, buildMap]);

  useEffect(() => {
    if (!shouldShowDialog) {
      setSelectedPoint(null);
    }
  }, [shouldShowDialog, setSelectedPoint]);

  useEffect(() => {
    if (shouldShowDialog && deliveryPointsStatus === "ok" && map.current) {
      renderPoints();
    }
  }, [
    shouldShowDialog,
    deliveryPointsStatus,
    deliveryPoints,
    renderPoints,
    map,
  ]);

  return (
    <Dialog open={shouldShowDialog} onClose={onClose} maxWidth="lg" keepMounted>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box
          sx={{
            position: "relative",
          }}
        >
          <Box
            ref={mapsContainerRef}
            sx={{
              width: 600,
              height: { xs: 400, md: 600 },
            }}
          ></Box>
          {deliveryPointsStatus === "fetching" ? (
            <>
              <Box
                sx={{
                  backdropFilter: "grayscale(90%) blur(3px)",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress
                  size={100}
                  sx={{
                    mb: 2,
                  }}
                />
                <Typography>Загружается список постаматов</Typography>
              </Box>
            </>
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: 400,
          }}
        >
          <DialogTitle>
            {selectedPoint
              ? `${selectedPoint.name} (${
                  deliveryCompanies[selectedPoint.type].name
                })`
              : "Выбор постамата"}
          </DialogTitle>
          {selectedPoint ? (
            <DialogContent>
              <Typography variant="h6">Адрес</Typography>
              <Typography paragraph>{selectedPoint.address}</Typography>
              <Typography variant="h6">Время работы</Typography>
              <Typography paragraph>{selectedPoint.workingTime}</Typography>
              <Contacts point={selectedPoint} />
              {selectedPoint.addressComment ? (
                <>
                  <Typography variant="h6">
                    Дополнительная информация
                  </Typography>
                  <Typography>{selectedPoint.addressComment}</Typography>
                </>
              ) : null}
            </DialogContent>
          ) : (
            <DialogContent>
              Выберите на карте удобный для вас постамат, чтобы проверить
              стоимость и срок доставки
            </DialogContent>
          )}
          <DialogActions>
            {selectedPoint ? (
              <>
                <Button onClick={onClose} autoFocus>
                  Отмена
                </Button>
                <Button onClick={onSelected}>Выбрать</Button>
              </>
            ) : (
              <Button onClick={onClose} autoFocus>
                Закрыть
              </Button>
            )}
          </DialogActions>
        </Box>
      </Box>
    </Dialog>
  );
}

function Contacts({ point }) {
  if (!point.email && !point.site && !point.phones) {
    return null;
  }

  const email = point.email ? (
    <Typography>
      Email <A href={`mailto:${point.email}`}>{point.email}</A>
    </Typography>
  ) : null;

  const site = point.site ? (
    <Typography>
      <A href={point.site} target="_blank">
        Веб страница отделения
      </A>
    </Typography>
  ) : null;

  const phones = point.phones ? <Phones phones={point.phones} /> : null;

  return (
    <>
      <Typography variant="h6">Контактная информация</Typography>
      <Typography component="div" paragraph>
        {phones}
        {email}
        {site}
      </Typography>
    </>
  );
}

function Phones({ phones }) {
  return (
    <Typography>
      Телефон{" "}
      {phones.map(({ number, additional }, index) => {
        const isLast = index === phones.length - 1;

        return additional ? (
          <Fragment key={number}>
            {number} ({additional}){isLast ? "" : ", "}
          </Fragment>
        ) : (
          <Fragment key={number}>
            <A href={`tel:${number}`}>{number}</A>
            {isLast ? "" : ", "}
          </Fragment>
        );
      })}
    </Typography>
  );
}
