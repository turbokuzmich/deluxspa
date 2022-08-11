import * as yup from "yup";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import LoginIcon from "@mui/icons-material/Login";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import CircularProgress from "@mui/material/CircularProgress";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { TextField } from "formik-mui";
import { Formik, Form, Field, useFormikContext } from "formik";
import { useCallback, useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

const initialValues = {
  email: "",
};

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Введите корректный адрес электронной почты")
    .required("Введите адрес электронной почты"),
});

export function AuthDialog({ open, handleClose }) {
  const [state, setState] = useState("initial");

  const onClose = useCallback(() => handleClose(), [handleClose]);

  const onSubmit = useCallback(async ({ email }) => {
    const { ok } = await signIn("email", {
      email,
      redirect: false,
    });

    if (ok) {
      setState("success");
    } else {
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (open) {
      setState("initial");
    }
  }, [open, setState]);

  return (
    <Dialog open={open} onClose={onClose}>
      {state === "initial" ? (
        <Formik
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={onSubmit}
        >
          <Form>
            <Title onClose={onClose} />
            <DialogContent>
              <DialogContentText paragraph>
                Для авторизации на сайте потребуется только адрес вашей
                электронной почты
              </DialogContentText>
              <Field
                fullWidth
                component={TextField}
                label="Электронная почта"
                name="email"
                variant="outlined"
              />
            </DialogContent>
            <DialogActions
              sx={{
                pr: 3,
                pb: 3,
                pl: 3,
              }}
            >
              <SubmitButton />
            </DialogActions>
          </Form>
        </Formik>
      ) : state === "success" ? (
        <>
          <Title onClose={onClose} />
          <DialogContent>
            <DialogContentText>
              Для авторизации, пожалуйста, воспользуйтесь ссылкой, отправленной
              на электронную почту
            </DialogContentText>
          </DialogContent>
        </>
      ) : (
        <>
          <Title onClose={onClose} />
          <DialogContent>
            <DialogContentText>
              Не удалось отправить письмо на указанный адрес. Пожалуйста,
              повторите попытку позже.
            </DialogContentText>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

export function Title({ onClose }) {
  return (
    <DialogTitle>
      Авторизация
      <IconButton
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
    </DialogTitle>
  );
}

export function SubmitButton() {
  const { isSubmitting } = useFormikContext();

  return (
    <Button type="submit" variant="contained" disabled={isSubmitting}>
      Войти
    </Button>
  );
}

export default function Auth() {
  const { data, status } = useSession();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogOut = useCallback(() => signOut(), []);

  const handleLogIn = useCallback(
    () => setIsDialogOpen(true),
    [setIsDialogOpen]
  );

  const handleClose = useCallback(
    () => setIsDialogOpen(false),
    [setIsDialogOpen]
  );

  if (status === "loading") {
    return <CircularProgress size={20} />;
  }

  if (status === "unauthenticated") {
    return (
      <>
        <AuthDialog open={isDialogOpen} handleClose={handleClose} />
        <IconButton onClick={handleLogIn}>
          <LoginIcon />
        </IconButton>
      </>
    );
  }

  return (
    <>
      <IconButton>
        <PermIdentityIcon />
      </IconButton>
    </>
  );
}
