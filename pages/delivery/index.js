import identity from "lodash/identity";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { deliveryCompanies } from "../../constants";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Layout from "../../components/layout";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MapLoader from "../../components/maploader";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Price from "../../components/price";
import DeliveryPointsDialog from "../../components/deliverypoints";
import CircularProgress from "@mui/material/CircularProgress";
import delivery, {
  getDeliveryCity,
  getDeliveryType,
  getDeliveryPoint,
  getDeliveryAddress,
  getDeliveryCityName,
  getGeocodingStatus,
  getCalculationStatus,
  getDeliveryCitySuggestions,
  getDeliveryCalculationResult,
  getDeliveryAddressSuggestions,
} from "../../store/slices/delivery";

export default function Delivery() {
  const dispatch = useDispatch();

  const city = useSelector(getDeliveryCity);
  const type = useSelector(getDeliveryType);
  const point = useSelector(getDeliveryPoint);
  const address = useSelector(getDeliveryAddress);
  const cityName = useSelector(getDeliveryCityName);
  const geocodingStatus = useSelector(getGeocodingStatus);
  const calculationStatus = useSelector(getCalculationStatus);
  const calculationResult = useSelector(getDeliveryCalculationResult);
  const addressSuggestions = useSelector(getDeliveryAddressSuggestions);
  const citySuggestions = useSelector(getDeliveryCitySuggestions);

  const onMapsReady = useCallback(
    () => dispatch(delivery.actions.apiLoaded()),
    []
  );

  const onAddressInputChange = useCallback(
    (_, newInput) => dispatch(delivery.actions.changeAddressInput(newInput)),
    []
  );

  const onCityInputChange = useCallback(
    (_, newInput) => dispatch(delivery.actions.changeCityInput(newInput)),
    []
  );

  const onAddressSelected = useCallback(
    (_, option) =>
      dispatch(delivery.actions.setAddress(option ? option.value : null)),
    []
  );

  const onCitySelected = useCallback((_, option) => {
    dispatch(delivery.actions.setCity(option ? option : null));
  }, []);

  const onTypeChange = useCallback(
    (_, newType) => dispatch(delivery.actions.setType(newType)),
    []
  );

  const onShowDialog = useCallback(
    () => dispatch(delivery.actions.showDialog()),
    []
  );

  const isOptionEqualToValue = useCallback(
    ({ value }, address) => value === address,
    []
  );

  return (
    <>
      <MapLoader onReady={onMapsReady} />
      <DeliveryPointsDialog />
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
                калькулятор доставки
              </Typography>
              <Typography variant="h5" paragraph>
                Выберите способ получения
              </Typography>
              <RadioGroup onChange={onTypeChange} value={type} sx={{ mb: 2 }}>
                <FormControlLabel
                  value="store"
                  control={<Radio />}
                  label="В постамат (СДЭК, Pickpoint)"
                />
                <FormControlLabel
                  value="home"
                  control={<Radio />}
                  label="В руки (только СДЭК)"
                />
              </RadioGroup>

              {type === "home" ? (
                <Autocomplete
                  disablePortal
                  autoComplete
                  value={address}
                  filterOptions={identity}
                  onInputChange={onAddressInputChange}
                  onChange={onAddressSelected}
                  options={addressSuggestions}
                  isOptionEqualToValue={isOptionEqualToValue}
                  sx={{ mb: 2 }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.value}>
                      {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Укажите адрес доставки"
                      fullWidth
                    />
                  )}
                />
              ) : null}

              {type === "store" ? (
                <Autocomplete
                  disablePortal
                  autoComplete
                  value={cityName}
                  filterOptions={identity}
                  onInputChange={onCityInputChange}
                  onChange={onCitySelected}
                  options={citySuggestions}
                  isOptionEqualToValue={isOptionEqualToValue}
                  sx={{ mb: 2 }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.value}>
                      {option.label}
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Укажите город доставки"
                      fullWidth
                    />
                  )}
                />
              ) : null}
              {type === "store" && city ? (
                <Typography paragraph>
                  <Button
                    color="warning"
                    variant="contained"
                    disabled={calculationStatus === "calculating"}
                    onClick={onShowDialog}
                  >
                    {point ? "Поменять ПВЗ" : "Выбрать ближайших ПВЗ"}
                  </Button>
                </Typography>
              ) : null}
              {type === "store" && point ? (
                <>
                  <Typography paragraph>
                    Выбран ПВЗ компании {deliveryCompanies[point.type].name} «
                    {point.name}» ({point.address})
                  </Typography>
                </>
              ) : null}
              {calculationStatus === "calculating" ? (
                <CircularProgress size={20} />
              ) : null}
              {calculationStatus === "ok" ? (
                <>
                  <Typography>
                    Стоимость доставки —{" "}
                    {calculationResult.sum ? (
                      <Price sum={calculationResult.sum} />
                    ) : (
                      "неизвестна"
                    )}
                  </Typography>
                  <Typography>
                    Минимальное время доставки в рабочих днях —{" "}
                    {calculationResult.min
                      ? calculationResult.min
                      : "неизвестно"}
                  </Typography>
                  <Typography>
                    Максимальное время доставки в рабочих днях —{" "}
                    {calculationResult.max
                      ? calculationResult.max
                      : "неизвестно"}
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
