import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import notificationsSlice, {
  getNotifications,
} from "../store/slices/notifications";

export default function Notifications() {
  const dispatch = useDispatch();

  const notifications = useSelector(getNotifications);

  const reverseNotifications = useMemo(
    () => [...notifications].reverse(),
    [notifications]
  );

  const closeHandlers = useMemo(
    () =>
      reverseNotifications.map(
        (notification) => () =>
          dispatch(notificationsSlice.actions.remove(notification.id))
      ),
    [reverseNotifications, dispatch]
  );

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: theme.spacing(2),
        left: theme.spacing(2),
      })}
    >
      <Stack
        spacing={2}
        sx={{
          width: "30vw",
        }}
      >
        {reverseNotifications.map((notification, index) => (
          <Alert
            key={notification.id}
            severity={notification.severity}
            variant="filled"
            onClose={closeHandlers[index]}
            sx={{ pt: 2, pb: 2, pl: 4, pr: 4 }}
          >
            {notification.message}
          </Alert>
        ))}
      </Stack>
    </Box>
  );
}
