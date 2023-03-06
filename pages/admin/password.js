import Layout from "../../admin/components/layout";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import get from "lodash/get";
import { setPassword } from "../../admin/store/actions";
import { string, object } from "yup";
import { Formik, Form, Field } from "formik";
import { TextField as TextInput } from "formik-mui";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { isFetching } from "../../admin/store/slices/ui";

const commonValidators = {
  password: string()
    .required("Необходимо ввести пароль")
    .min(6, "Длина пароля не менее 6 символов")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Пароль должен содержать как минимум одну строчную букву, одну заглавную букву, одно число и один специальный символ"
    ),
};

const typedValidators = {
  email: object({
    ...commonValidators,
    key: string()
      .trim()
      .required("Необходимо указать адрес электронной почты")
      .email("Необходимо указать корректный адрес электронной почты"),
  }),
};

export default function Admin() {
  const dispatch = useDispatch();

  const { query } = useRouter();

  const type = get(query, "type");
  const key = get(query, "key", "");

  const disabled = useSelector(isFetching);

  const formValues = {
    key,
    password: "",
  };

  const keyLabel = useMemo(
    () => ({ email: "Элекстронный адрес" }[type]),
    [type]
  );

  const onSubmit = useCallback(
    ({ key, password }) => dispatch(setPassword({ key, type, password })),
    [dispatch, type]
  );

  return (
    <Layout title="Пароли">
      <Typography variant="h4" paragraph>
        Новый пароль для
      </Typography>
      <Typography paragraph>{key}</Typography>
      <Formik
        initialValues={formValues}
        onSubmit={onSubmit}
        validationSchema={typedValidators[type]}
        validateOnMount
      >
        {(props) => (
          <Form>
            <Field
              component={TextInput}
              label={keyLabel}
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
    </Layout>
  );
}
