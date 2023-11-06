import memoize from "lodash/memoize";
import {
  orderStatusesKeys,
  discountPercentPrice,
  maxDiscount,
} from "../../constants";

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

/**
 * @param {number} count
 * @param {number} subtotal
 * @param {number} [fixed=0]
 *
 * @returns {number}
 */
export function getDiscount(count, subtotal, fixed = 0) {
  const progressive =
    count > 1 ? Math.floor(subtotal / discountPercentPrice) : 0;

  return Math.min(Math.max(fixed, progressive), maxDiscount);
}

/**
 * @param {number} price
 * @param {number} discount
 *
 * @returns {number}
 */
export function getPriceWithDiscount(price, discount) {
  return parseFloat((price * ((100 - discount) / 100)).toFixed(2));
}

/**
 * @param {Array.<{ qty: number; price: number }>} items
 * @param {number} discount
 *
 * @returns {number}
 */
export function getSubtotal(items, discount) {
  return items.reduce(
    (total, item) =>
      total + getPriceWithDiscount(item.price, discount) * item.qty,
    0
  );
}
