import * as yup from "yup";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import Layout from "../../components/layout";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import TelegramIcon from "@mui/icons-material/Telegram";
import A from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Link from "next/link";
import Image from "../../components/image";
import Button from "@mui/material/Button";
import { PatternFormat } from "react-number-format";
import { Formik, Form, Field, useField, useFormikContext } from "formik";
import { TextField as TextInput } from "formik-mui";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useTranslation } from "next-i18next";
import { useDispatch, useSelector } from "react-redux";
import { setup } from "../../lib/backend/csrf";
import feedbackSlice, {
  getFeedbackFormValues,
  getFeedBackStatus,
} from "../../store/slices/feedback";
import { useCallback, useMemo, useRef } from "react";
import { phoneFormat } from "../../constants";

export default function About() {
  const { t } = useTranslation();

  const dispatch = useDispatch();

  const phoneFieldRef = useRef(null);

  const formValues = useSelector(getFeedbackFormValues);
  const formStatus = useSelector(getFeedBackStatus);

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        phone: yup
          .string()
          .trim()
          .required(t("cart-page-phone-number-empty"))
          .matches(/^\d{10}$/, t("cart-page-phone-number-incorrect")),
        email: yup.string().email(t("cart-page-email-incorrect")),
        message: yup
          .string()
          .trim()
          .required("Пожалуйста, напишите нам сообщение"),
      }),
    [t]
  );

  const onFeedBackSubmit = useCallback(
    (values) => {
      dispatch(feedbackSlice.actions.submit(values));
    },
    [dispatch]
  );

  return (
    <Layout title={t("page-title-about")}>
      <>
        <Container
          sx={{
            mb: 4,
          }}
        >
          <Image
            src="/images/about.jpg"
            alt="about"
            sx={{
              maxWidth: "100%",
            }}
          />
        </Container>
        <Container sx={{ mb: 4 }}>
          <Box
            sx={{
              gap: {
                md: 8,
              },
              display: {
                md: "flex",
              },
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{ textTransform: "uppercase" }}
                paragraph
              >
                DeluxSPA
              </Typography>
              <Typography variant="h5" paragraph>
                {t("about-page-title")}
              </Typography>
              <Typography variant="subtitle1">
                {t("about-page-text")}{" "}
                <Link href="mailto:office@deluxspa.ru" passHref>
                  <A>office@deluxspa.ru</A>
                </Link>
                ,{" "}
                <Link href="https://wa.me/79263853751" passHref>
                  <A>WhatsApp</A>
                </Link>{" "}
                {t("about-page-or")}{" "}
                <Link href="https://t.me/neon_beard" passHref>
                  <A>Telegram</A>
                </Link>
                , {t("about-page-call")}{" "}
                <Link href="tel:+74956659015" passHref>
                  <A>{t("about-page-directly")}</A>
                </Link>
                .
              </Typography>
            </Box>
            <Box
              sx={{
                width: {
                  md: 400,
                },
                flexShrink: 0,
              }}
            >
              <Typography
                variant="h4"
                sx={{ textTransform: "uppercase" }}
                paragraph
              >
                {t("bank-requisites")}
              </Typography>
              <Typography variant="h6" paragraph>
                {t("company-full-name")}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("payment-account")}
                      </TableCell>
                      <TableCell align="right">40702810200000000401</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("correspondent-account")}
                      </TableCell>
                      <TableCell align="right">30101810200000000700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("bik")}
                      </TableCell>
                      <TableCell align="right">044525700</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("inn")}
                      </TableCell>
                      <TableCell align="right">7751525117</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("kpp")}
                      </TableCell>
                      <TableCell align="right">775001001</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("okpo")}
                      </TableCell>
                      <TableCell align="right">42943661</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {t("ogrn")}
                      </TableCell>
                      <TableCell align="right">5147746230297</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Container>
        <Container sx={{ mb: 4 }}>
          <Card elevation={0} square>
            <CardContent
              sx={{
                pt: 3,
                pl: 4,
                pr: 4,
              }}
            >
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="h4">
                    Остались вопросы? Свяжитесь с нами!
                  </Typography>
                </Grid>
                <Grid item xs={8}>
                  <Formik
                    initialValues={formValues}
                    onSubmit={onFeedBackSubmit}
                    validationSchema={validationSchema}
                    enableReinitialize
                    validateOnMount
                  >
                    <Form>
                      <Field
                        component={TextInput}
                        label="Имя"
                        autoComplete="off"
                        name="name"
                        margin="normal"
                        disabled={formStatus !== "initial"}
                        fullWidth
                      />
                      <PhoneInput inputRef={phoneFieldRef} />
                      <Field
                        component={TextInput}
                        label="Email"
                        autoComplete="off"
                        margin="normal"
                        disabled={formStatus !== "initial"}
                        name="email"
                        fullWidth
                      />
                      <Field
                        component={TextInput}
                        label="Сообщение"
                        autoComplete="off"
                        name="message"
                        margin="normal"
                        disabled={formStatus !== "initial"}
                        rows={4}
                        multiline
                        fullWidth
                      />
                      <FeedBackSubmitButton status={formStatus} />
                    </Form>
                  </Formik>
                </Grid>
                <Grid item xs={4}>
                  <Box
                    sx={{
                      mb: 2,
                      gap: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <IconButton>
                        <PhoneIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="h6">
                        <Link href="tel:+74956659015" passHref>
                          <A>+7 495 665 9015</A>
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      mb: 2,
                      gap: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <IconButton>
                        <EmailIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="h6">
                        <Link href="mailto:office@deluxspa.ru" passHref>
                          <A>office@deluxspa.ru</A>
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      mb: 2,
                      gap: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <IconButton>
                        <WhatsAppIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="h6">
                        <Link href="https://wa.me/79263853751" passHref>
                          <A>WhatsApp</A>
                        </Link>
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      gap: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <IconButton>
                        <TelegramIcon sx={{ fontSize: 32 }} />
                      </IconButton>
                    </Box>
                    <Box>
                      <Typography variant="h6">
                        <Link href="https://t.me/neon_beard" passHref>
                          <A>Telegram</A>
                        </Link>{" "}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      </>
    </Layout>
  );
}

export const getServerSideProps = setup(async function (props) {
  const { locale } = props;

  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
});

function FeedBackSubmitButton({ status }) {
  const { t } = useTranslation();
  const { isValid, submitForm } = useFormikContext();

  return (
    <Button
      size="large"
      variant="contained"
      disabled={!isValid || status !== "initial"}
      onClick={submitForm}
      fullWidth
      sx={{
        mt: 2,
        p: 2,
      }}
    >
      отправить
    </Button>
  );
}
// FIXME copypaste
function PhoneInputBase({ inputRef, ...props }) {
  const { t } = useTranslation();
  const [{ name }, { error, touched }] = useField("phone");

  return (
    <TextField
      {...props}
      error={touched && Boolean(error)}
      helperText={touched ? error : undefined}
      inputRef={inputRef}
      margin="normal"
      label={t("cart-page-phone")}
      autoComplete="off"
      name={name}
      fullWidth
      required
    />
  );
}

// FIXME copypaste
function PhoneInput({ inputRef }) {
  const [{ value, onBlur }, _, { setValue }] = useField("phone");

  const onValueChange = useCallback(({ value }) => setValue(value), [setValue]);

  const renderInput = useCallback(
    (props) => <PhoneInputBase inputRef={inputRef} {...props} />,
    [inputRef]
  );

  return (
    <PatternFormat
      mask="_"
      value={value}
      onBlur={onBlur}
      format={phoneFormat}
      customInput={renderInput}
      onValueChange={onValueChange}
      allowEmptyFormatting
      valueIsNumericString
    />
  );
}
