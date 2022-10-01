import identity from "lodash/identity";
import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
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
import delivery, {
  getDeliveryType,
  getDeliveryPoint,
  getDeliveryAddress,
  getGeocodingStatus,
  getCalculationStatus,
  getDeliverySuggestions,
  getDeliveryCalculationResult,
} from "../../store/slices/delivery";

export default function Delivery() {
  const dispatch = useDispatch();

  const type = useSelector(getDeliveryType);
  const point = useSelector(getDeliveryPoint);
  const address = useSelector(getDeliveryAddress);
  const suggestions = useSelector(getDeliverySuggestions);
  const geocodingStatus = useSelector(getGeocodingStatus);
  const calculationStatus = useSelector(getCalculationStatus);
  const calculationResult = useSelector(getDeliveryCalculationResult);

  const onMapsReady = useCallback(
    () => dispatch(delivery.actions.apiLoaded()),
    []
  );

  const onInputChange = useCallback(
    (_, newInput) => dispatch(delivery.actions.changeInput(newInput)),
    []
  );

  const onAddressSelected = useCallback(
    (_, option) =>
      dispatch(delivery.actions.setAddress(option ? option.value : null)),
    []
  );

  const onTypeChange = useCallback(
    (_, newType) => dispatch(delivery.actions.setType(newType)),
    []
  );

  const onCalculate = useCallback(
    () => dispatch(delivery.actions.calculate()),
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
              <Autocomplete
                disablePortal
                autoComplete
                value={address}
                options={suggestions}
                filterOptions={identity}
                onInputChange={onInputChange}
                onChange={onAddressSelected}
                isOptionEqualToValue={isOptionEqualToValue}
                sx={{ mb: 2 }}
                renderOption={(props, option) => (
                  <li {...props}>{option.label}</li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Укажите адрес доставки"
                    fullWidth
                  />
                )}
              />
              {geocodingStatus === "ok" ? (
                <>
                  <Typography variant="h5" paragraph>
                    Выберите способ получения
                  </Typography>
                  <RadioGroup
                    onChange={onTypeChange}
                    value={type}
                    sx={{ mb: 2 }}
                  >
                    <FormControlLabel
                      value="home"
                      control={<Radio />}
                      label="Привезти домой"
                    />
                    <FormControlLabel
                      value="store"
                      control={<Radio />}
                      label="Заберу из постамата"
                    />
                  </RadioGroup>
                  {type === "store" ? (
                    <>
                      {point ? (
                        <Typography paragraph>
                          Выбран ПВЗ «{point.name}» (
                          {point.location.address_full})
                        </Typography>
                      ) : null}
                      <Typography paragraph>
                        <Button
                          color="warning"
                          variant="contained"
                          onClick={onShowDialog}
                        >
                          {point ? "Поменять ПВЗ" : "Выбрать ближайших ПВЗ"}
                        </Button>
                      </Typography>
                    </>
                  ) : null}
                  <Button
                    sx={{ mb: 2 }}
                    color="primary"
                    variant="contained"
                    onClick={onCalculate}
                    disabled={calculationStatus === "calculating"}
                  >
                    Рассчитать
                  </Button>
                </>
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
