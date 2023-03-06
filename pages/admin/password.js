import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import get from "lodash/get";
import { setPassword } from "../../admin/store/actions";
import { string, object, array } from "yup";
import { Formik, Form, Field } from "formik";
import { TextField as TextInput } from "formik-mui";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { isFetching } from "../../admin/store/slices/ui";

const password = string()
  .required("Необходимо ввести пароль")
  .min(6, "Длина пароля не менее 6 символов")
  .matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    "Пароль должен содержать как минимум одну строчную букву, одну заглавную букву, одно число и один специальный символ"
  );

const typedValidators = {
  email: object({
    password,
    key: string()
      .trim()
      .required("Необходимо указать адрес электронной почты")
      .email("Необходимо указать корректный адрес электронной почты"),
  }),
  site: object({
    url: string().trim().nullable(),
    brief: string().trim().nullable(),
    login: string().trim().required(),
    name: string().trim().required(),
    names: string().trim().nullable(),
    password,
  }),
};

export function EmailPassword({ key }) {
  const dispatch = useDispatch();

  const disabled = useSelector(isFetching);

  const formValues = {
    key,
    password: "",
  };

  const onSubmit = useCallback(
    ({ key, password }) =>
      dispatch(setPassword({ key, password, type: "email" })),
    [dispatch]
  );

  return (
    <>
      <Typography variant="h4" paragraph>
        Новый пароль для
      </Typography>
      <Typography paragraph>{key}</Typography>
      <Formik
        initialValues={formValues}
        onSubmit={onSubmit}
        validationSchema={typedValidators.email}
        validateOnMount
      >
        {(props) => (
          <Form>
            <Field
              component={TextInput}
              label="Электронный адрес"
              autoComplete="off"
              name="key"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Field
              component={TextInput}
              label="Пароль"
              autoComplete="off"
              name="password"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Button
              variant="contained"
              size="large"
              disabled={!props.isValid || disabled}
              type="submit"
            >
              Установить
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
}

export function SitePassword({ key }) {
  const dispatch = useDispatch();

  const values = {
    key,
    url: "",
    name: "",
    brief: "",
    login: "",
    password: "",
    names: "",
  };

  const disabled = useSelector(isFetching);

  const onSubmit = useCallback(
    (values) => dispatch(setPassword({ ...values, type: "site" })),
    [dispatch]
  );

  return (
    <>
      <Typography variant="h4" paragraph>
        Новый пароль
      </Typography>
      <Formik
        initialValues={values}
        onSubmit={onSubmit}
        validationSchema={typedValidators.site}
        validateOnMount
      >
        {(props) => (
          <Form>
            <Field
              component={TextInput}
              label="Название сайта"
              autoComplete="off"
              name="name"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Field
              component={TextInput}
              label="Названия для поиска"
              autoComplete="off"
              name="names"
              rows={4}
              multiline
              sx={{ mb: 2 }}
              fullWidth
            />
            <Field
              component={TextInput}
              label="URL"
              autoComplete="off"
              name="url"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Field
              component={TextInput}
              label="Описание"
              autoComplete="off"
              name="brief"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Field
              component={TextInput}
              label="Логин"
              autoComplete="off"
              name="login"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Field
              component={TextInput}
              label="Пароль"
              autoComplete="off"
              name="password"
              sx={{ mb: 2 }}
              fullWidth
            />
            <Button
              variant="contained"
              size="large"
              disabled={!props.isValid || disabled}
              type="submit"
            >
              Установить
            </Button>
          </Form>
        )}
      </Formik>
    </>
  );
}

export default function Password() {
  const { query } = useRouter();

  const type = get(query, "type");
  const key = get(query, "key", "");

  if (type === "email") {
    return <EmailPassword key={key} />;
  } else if (type === "site") {
    return <SitePassword key={key} />;
  }
}
