import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import { useCallback, useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import deliverySlice, {
  getDeliveryPoints,
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

  const [selectedPoint, setSelectedPoint] = useState(null);

  const onClose = useCallback(
    () => dispatch(deliverySlice.actions.hideDialog()),
    []
  );

  const onSelected = useCallback(() => {
    dispatch(deliverySlice.actions.setDeliveryPoint(selectedPoint));
    dispatch(deliverySlice.actions.hideDialog());
  }, [selectedPoint]);

  const onPlacemarkClick = useCallback((point) => setSelectedPoint(point), []);

  const buildMap = useCallback(() => {
    if (map.current) {
      return;
    }

    map.current = new ymaps.Map(mapsContainerRef.current, {
      center: [55.76, 37.64],
      zoom: 5,
      controls: ["smallMapDefaultSet"],
    });

    const clusterer = new ymaps.Clusterer({
      groupByCoordinates: false,
      clusterDisableClickZoom: true,
      clusterHideIconOnBalloonOpen: false,
      geoObjectHideIconOnBalloonOpen: false,
    });

    const placemarks = deliveryPoints.map((point) => {
      const placemark = new ymaps.Placemark(
        [point.location.latitude, point.location.longitude],
        {
          balloonContentHeader: point.name,
          balloonContentBody: point.location.address_full,
        },
        {
          preset: "islands#circleIcon",
        }
      );

      placemark.events.add("click", () => onPlacemarkClick(point));

      return placemark;
    });

    clusterer.add(placemarks);
    map.current.geoObjects.add(clusterer);
  }, [deliveryPoints]);

  useEffect(() => {
    if (shouldShowDialog && deliveryPointsStatus === "ok") {
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

  return (
    <Dialog open={shouldShowDialog} onClose={onClose} maxWidth="lg" keepMounted>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Box
          ref={mapsContainerRef}
          sx={{
            width: 600,
            height: { xs: 400, md: 600 },
          }}
        ></Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: 400,
          }}
        >
          <DialogTitle>
            {selectedPoint ? selectedPoint.name : "Выберите ПВЗ"}
          </DialogTitle>
          {selectedPoint ? (
            <DialogContent>
              <Typography paragraph>
                {selectedPoint.location.address_full} (
                {selectedPoint.address_comment})
              </Typography>
              <Typography>{selectedPoint.work_time}</Typography>
            </DialogContent>
          ) : (
            <DialogContent>тут пока ничего нет</DialogContent>
          )}
          <DialogActions>
            {selectedPoint ? (
              <>
                <Button onClick={onClose} autoFocus>
                  Отмена
                </Button>
                <Button onClick={onSelected}>Сохранить</Button>
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
