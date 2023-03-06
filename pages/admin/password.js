import Layout from "../../admin/components/layout";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import get from "lodash/get";
import { sendData } from "../../admin/store";
import { string, object } from "yup";
import { Formik, Form, Field } from "formik";
import { TextField as TextInput } from "formik-mui";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { useCallback } from "react";

const formValues = { password: "" };

const validators = object({
  password: string()
    .required("Необходимо ввести пароль")
    .min(6, "Длина пароля не менее 6 символов")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
      "Пароль должен содержать как минимум одну строчную букву, одну заглавную букву, одно число и один специальный символ"
    ),
});

export default function Admin() {
  const dispatch = useDispatch();

  const { query } = useRouter();

  const type = get(query, "type");
  const key = get(query, "key");

  const onSubmit = useCallback(({ password }) => {
    const sendData = get(
      window,
      ["Telegram", "WebApp", "sendData"],
      console.log
    );

    sendData(JSON.stringify({ p: password, t: type, k: key }));
  }, []);

  return (
    <Layout title="Пароли">
      <Typography variant="h4" paragraph>
        Новый пароль для
      </Typography>
      <Typography paragraph>{key}</Typography>
      <Formik
        initialValues={formValues}
        onSubmit={onSubmit}
        validationSchema={validators}
        validateOnMount
      >
        {(props) => (
          <Form>
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
              disabled={!props.isValid}
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
