import MapLoader from "../../components/maploader";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useRef, useEffect, useCallback } from "react";
import identity from "lodash/identity";
import deliverySlice, {
  getDeliveryCitySuggestions,
  getDeliveryCity,
  getDeliveryPoints,
  getDeliveryPoint,
  getDeliveryCalculation,
} from "../../store/slices/delivery";

export default function Cdek() {
  const dispatch = useDispatch();

  const city = useSelector(getDeliveryCity);
  const citySuggestions = useSelector(getDeliveryCitySuggestions);
  const points = useSelector(getDeliveryPoints);
  const point = useSelector(getDeliveryPoint);
  const calculation = useSelector(getDeliveryCalculation);

  const mapsContainerRef = useRef();
  const map = useRef();

  const onMapsReady = useCallback(
    () => dispatch(deliverySlice.actions.apiLoaded()),
    [dispatch]
  );

  const onTitleInputChange = useCallback(
    (_, newInput) => dispatch(deliverySlice.actions.changeTitleInput(newInput)),
    [dispatch]
  );

  const onCitySelected = useCallback(
    (_, option) =>
      dispatch(deliverySlice.actions.setCity(option ? option : null)),
    [dispatch]
  );

  const onPointSelected = useCallback(
    (point) => {
      dispatch(deliverySlice.actions.setPoint(point));
    },
    [dispatch]
  );

  const isOptionEqualToValue = useCallback((cityA, cityB) => {
    return cityA.code === cityB.code;
  }, []);

  useEffect(() => {
    if (city) {
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }

      const { latitude, longitude } = city;

      map.current = new ymaps.Map(mapsContainerRef.current, {
        center: [latitude, longitude],
        zoom: 11,
        controls: ["smallMapDefaultSet"],
      });
    } else {
      if (map.current) {
        map.current.destroy();
        map.current = null;
      }
    }
  }, [city]);

  useEffect(() => {
    if (map.current) {
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

      const placemarks = points.map((point) => {
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

        placemark.events.add(["click", "deluxspa:selected"], () =>
          onPointSelected(point)
        );

        return placemark;
      });

      clusterer.add(placemarks);
      map.current.geoObjects.add(clusterer);
    }
  }, [points, onPointSelected]);

  return (
    <>
      <MapLoader onReady={onMapsReady} />
      <Autocomplete
        disablePortal
        autoComplete
        value={city}
        filterOptions={identity}
        onInputChange={onTitleInputChange}
        onChange={onCitySelected}
        options={citySuggestions}
        isOptionEqualToValue={isOptionEqualToValue}
        renderOption={(props, option) => (
          <li {...props} key={option.value}>
            {option.label}
          </li>
        )}
        renderInput={(params) => (
          <TextField {...params} label="Город" fullWidth />
        )}
      />
      {city ? (
        <>
          <Box
            ref={mapsContainerRef}
            sx={{
              height: { xs: 400, md: 600 },
            }}
          ></Box>
          {point ? (
            <>
              <Typography>
                Выбран пункт «{point.name}» по адресу:{" "}
                {point.location.address_full}
              </Typography>
              {calculation && calculation.errors ? (
                <Typography>
                  Не удалось рассчитать стоимость доставки
                </Typography>
              ) : null}
              {calculation && calculation.total_sum ? (
                <>
                  <Typography>
                    Стоимость доставки — {calculation.total_sum}
                  </Typography>
                  <Typography>
                    Скрок доставки — от {calculation.period_min} до{" "}
                    {calculation.period_max} дней
                  </Typography>
                </>
              ) : null}
            </>
          ) : (
            <Typography>Пожалуйста, выберите точку доставки</Typography>
          )}
        </>
      ) : (
        <Typography>Пожалуйста, выберите город доставки</Typography>
      )}
    </>
  );
}
