import memoize from "lodash/memoize";
import { orderStatusesKeys } from "../../constants";

export const getHumanStatus = memoize((status) => {
  return {
    [orderStatusesKeys.created]: "создан",
    [orderStatusesKeys.pending]: "ожидает оплаты",
    [orderStatusesKeys.waiting_for_capture]: "ожидает оплаты",
    [orderStatusesKeys.succeeded]: "оплачен",
    [orderStatusesKeys.canceled]: "отменен",
    [orderStatusesKeys.preparing]: "готовится к отправке",
    [orderStatusesKeys.shipping]: "в пути",
    [orderStatusesKeys.delivered]: "доставлен",
  }[status];
});

export const getAvailableStatusesForStatus = memoize((status) => {
  if (status === orderStatusesKeys.created) {
    return [
      orderStatusesKeys.pending,
      orderStatusesKeys.succeeded,
      orderStatusesKeys.canceled,
    ];
  }
  if (status === orderStatusesKeys.pending) {
    return [orderStatusesKeys.succeeded, orderStatusesKeys.canceled];
  }
  if (status === orderStatusesKeys.succeeded) {
    return [orderStatusesKeys.preparing, orderStatusesKeys.canceled];
  }
  if (status === orderStatusesKeys.preparing) {
    return [orderStatusesKeys.shipping, orderStatusesKeys.canceled];
  }
  if (status === orderStatusesKeys.shipping) {
    return [orderStatusesKeys.delivered, orderStatusesKeys.canceled];
  }

  return [];
});
