import * as yup from "yup";
import { None, Some } from "@sniptt/monads";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Formik, Form, Field, useFormikContext } from "formik";
import { TextField as TextInput } from "formik-mui";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { setup } from "../../lib/backend/csrf";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { maybeGetSession } from "../../lib/backend/session";
import { useRouter } from "next/router";
import authSlice, {
  AuthFormState,
  getAuthFormCodeValues,
  getAuthFormEmail,
  getAuthFormEmailValues,
  getAuthFormState,
} from "../../store/slices/auth";

export default function Auth() {
  const { t } = useTranslation();
  const { query } = useRouter();

  const dispatch = useDispatch();

  const authFormState = useSelector(getAuthFormState);
  const authFormEmail = useSelector(getAuthFormEmail);
  const emailFormValues = useSelector(getAuthFormEmailValues);
  const codeFormValues = useSelector(getAuthFormCodeValues);

  const phoneSchema = useMemo(
    () =>
      yup.object().shape({
        country: yup
          .string()
          .required()
          .matches(/^\d+$/, "Укажите код страны")
          .max(3, "Укажите код страны"),
        phone: yup
          .string()
          .required()
          .matches(/^\d+$/, "Укажите номер телефона")
          .max(11, "Укажите номер телефона"),
      }),
    []
  );

  const emailSchema = useMemo(
    () =>
      yup.object().shape({
        email: yup
          .string()
          .required(t("cart-page-email-incorrect"))
          .email(t("cart-page-email-incorrect")),
        country: yup
          .string()
          .optional()
          .matches(/^\d+$/, "Укажите код страны")
          .max(3, "Укажите код страны"),
        phone: yup
          .string()
          .optional()
          .matches(/^\d+$/, "Укажите номер телефона")
          .max(11, "Укажите номер телефона"),
      }),
    [t]
  );

  const codeSchema = useMemo(
    () =>
      yup.object().shape({
        code: yup
          .string()
          .required("Введите проверочный код")
          .length(6, "Введите 6 цифр проверочного кода")
          .matches(/^\d+$/, "Введите 6 цифр проверочного кода"),
      }),
    []
  );

  const { country, phone } = useMemo(() => {
    try {
      return phoneSchema.validateSync(query, {
        strict: true,
        stripUnknown: true,
      });
    } catch (error) {
      return { country: null, phone: null };
    }
  }, [query, phoneSchema]);

  const onEmailSubmit = useCallback(
    ({ email }) => {
      dispatch(authSlice.actions.setAuthFormEmail({ email, country, phone }));
    },
    [dispatch, phone, country]
  );

  const onCodeSubmit = useCallback(
    ({ code }) => {
      dispatch(authSlice.actions.setAuthFormCode(code));
    },
    [dispatch]
  );

  const onResetForm = useCallback(() => {
    dispatch(authSlice.actions.resetAuthForm());
  }, [dispatch]);

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
          Авторизация
        </Typography>
        {authFormState === AuthFormState.email ? (
          <>
            <Typography>
              Для авторизации на сайте, пожалуйста, укажите ваш электронный
              адрес
            </Typography>
            <Formik
              initialValues={emailFormValues}
              onSubmit={onEmailSubmit}
              validationSchema={emailSchema}
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
                    label="Email"
                    autoComplete="off"
                    margin="normal"
                    name="email"
                    sx={{
                      width: "100%",
                      maxWidth: "400px",
                    }}
                  />
                  <SubmitButton>отправить код подтверждения</SubmitButton>
                </Box>
              </Form>
            </Formik>
          </>
        ) : null}
        {authFormState === AuthFormState.code ? (
          <>
            <Typography>
              Пожалуйста, введите код подтверждения, отправленный на адрес{" "}
              {authFormEmail}
            </Typography>
            <Formik
              initialValues={codeFormValues}
              onSubmit={onCodeSubmit}
              validationSchema={codeSchema}
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
                    label="Код подтверждения"
                    autoComplete="off"
                    margin="normal"
                    name="code"
                    sx={{
                      width: "100%",
                      maxWidth: "400px",
                    }}
                  />
                  <SubmitButton>войти</SubmitButton>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={onResetForm}
                    sx={{
                      p: 2,
                      width: "100%",
                      maxWidth: "400px",
                    }}
                  >
                    сбросить
                  </Button>
                </Box>
              </Form>
            </Formik>
          </>
        ) : null}
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
        width: "100%",
        maxWidth: "400px",
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
          props: {
            ...translations,
            titleKey: "page-title-auth",
          },
        };
      },
      some() {
        return {
          redirect: {
            statusCode: 302,
            destination: "/profile",
          },
        };
      },
    });
});
