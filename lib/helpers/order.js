import memoize from "lodash/memoize";

export const getHumanStatus = memoize((status) => {
  return {
    created: "создан",
    pending: "ожидает оплаты",
    waiting_for_capture: "ожидает оплаты",
    succeeded: "оплачен",
    canceled: "отменен",
    delivered: "доставлен",
  }[status];
});
