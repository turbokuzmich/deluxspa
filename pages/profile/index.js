import * as yup from "yup";
import property from "lodash/property";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { Formik, Form, Field, useFormikContext } from "formik";
import { TextField as TextInput } from "formik-mui";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { setup } from "../../lib/backend/csrf";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { maybeGetSession } from "../../lib/backend/session";
import { None, Some } from "@sniptt/monads";
import { userType } from "../../constants";
import { useRouter } from "next/router";
import authSlice, {
  getAuthProfileValues,
  getAuthUser,
  getAuthUserDiscount,
  getAuthUserEmail,
} from "../../store/slices/auth";

export default function Profile() {
  const { push } = useRouter();

  const dispatch = useDispatch();

  const user = useSelector(getAuthUser);
  const email = useSelector(getAuthUserEmail);
  const discount = useSelector(getAuthUserDiscount);
  const values = useSelector(getAuthProfileValues);

  const schema = useMemo(
    () =>
      yup.object().shape({
        country: yup
          .string()
          .nullable()
          .optional()
          .matches(/^\d+$/, "Укажите код страны")
          .max(3, "Укажите код страны"),
        phone: yup
          .string()
          .nullable()
          .optional()
          .matches(/^\d+$/, "Укажите номер телефона")
          .max(11, "Укажите номер телефона"),
        type: yup.string().oneOf(Object.keys(userType)),
      }),
    []
  );

  const onProfileUpdate = useCallback(
    (user) => {
      dispatch(authSlice.actions.patchUser(user));
    },
    [dispatch]
  );

  const onLogout = useCallback(() => {
    push({ pathname: "/" }, "/").then(() => {
      dispatch(authSlice.actions.logout());
    });
  }, [dispatch, push]);

  return (
    <Container>
      <Box
        sx={{
          pt: {
            xs: 4,
            md: 8,
          },
          pb: {
            xs: 4,
            md: 8,
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            textTransform: "uppercase",
            mb: 4,
          }}
        >
          Личный кабинет
        </Typography>
        <Box
          sx={{
            display: {
              md: "flex",
            },
            gap: {
              md: 8,
            },
          }}
        >
          <Box
            sx={{
              flexGrow: 1,
              mb: {
                xs: 2,
                md: 0,
              },
            }}
          >
            {user ? (
              <Formik
                initialValues={values}
                onSubmit={onProfileUpdate}
                validationSchema={schema}
                enableReinitialize
                validateOnMount
              >
                <Form>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                    }}
                  >
                    <Field
                      component={TextInput}
                      label="ФИО"
                      autoComplete="off"
                      margin="normal"
                      name="name"
                    />
                    <Field
                      component={TextInput}
                      type="text"
                      name="type"
                      label="Тип"
                      select
                      // variant="standard"
                      margin="normal"
                    >
                      {Array.from(Object.entries(userType)).map(
                        ([value, label]) => (
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        )
                      )}
                    </Field>
                    <Box
                      sx={{
                        gap: 1,
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "baseline",
                      }}
                    >
                      <Typography>+</Typography>
                      <Field
                        component={TextInput}
                        label="Страна"
                        autoComplete="off"
                        margin="normal"
                        name="country"
                        sx={{
                          width: 100,
                        }}
                      />
                      <Field
                        component={TextInput}
                        label="Номер"
                        autoComplete="off"
                        margin="normal"
                        name="phone"
                        sx={{
                          width: 200,
                        }}
                      />
                    </Box>
                    <Field
                      component={TextInput}
                      label="Компания"
                      autoComplete="off"
                      margin="normal"
                      name="company"
                    />
                    <Field
                      component={TextInput}
                      label="Сайт"
                      autoComplete="off"
                      margin="normal"
                      name="site"
                    />
                    <SubmitButton>Сохранить</SubmitButton>
                  </Box>
                </Form>
              </Formik>
            ) : (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <CircularProgress />
              </Box>
            )}
          </Box>
          <Box
            sx={{
              flexShrink: 0,
              width: {
                md: 400,
              },
            }}
          >
            <Card elevation={0} square>
              <CardContent
                sx={{
                  pt: 3,
                  pl: 4,
                  pr: 4,
                }}
              >
                <Typography variant="h5">Электронный адрес</Typography>
                <Typography paragraph>{email}</Typography>
                <Typography variant="h5">Персональная скидка</Typography>
                <Typography paragraph>{discount}%</Typography>
                <Button
                  size="large"
                  variant="contained"
                  onClick={onLogout}
                  fullWidth
                  sx={{
                    p: 2,
                  }}
                >
                  Выйти
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

function SubmitButton({ children }) {
  const { isValid, submitForm } = useFormikContext();

  return (
    <Button
      size="large"
      variant="contained"
      disabled={!isValid}
      onClick={submitForm}
      sx={{
        p: 2,
      }}
    >
      {children}
    </Button>
  );
}

export const getServerSideProps = setup(async function (props) {
  const { locale, req } = props;

  const [session, translations] = await Promise.all([
    maybeGetSession(req),
    serverSideTranslations(locale, ["common"]),
  ]);

  return session
    .andThen((session) => (session.user ? Some(session.user) : None))
    .match({
      none() {
        return {
          redirect: {
            statusCode: 302,
            destination: "/auth",
          },
        };
      },
      some() {
        return {
          props: {
            ...translations,
            titleKey: "page-title-profile",
          },
        };
      },
    });
});
