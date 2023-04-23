import axios from "axios";
import { createHash } from "crypto";

const api = axios.create({
  baseURL: process.env.MODUL_BANK_API_URL,
  header: {
    "content-type": "application/json",
  },
});

export function withSignature(fields) {
  const values = Object.keys(fields)
    .filter((key) => key !== "signature")
    .filter((key) => fields[key] != "")
    .sort()
    .map((key) => `${key}=${Buffer.from(fields[key]).toString("base64")}`)
    .join("&");

  const signedValues = createHash("sha1")
    .update(process.env.MODUL_BANK_KEY + values)
    .digest("hex");

  const signature = createHash("sha1")
    .update(process.env.MODUL_BANK_KEY + signedValues)
    .digest("hex");

  return { ...fields, signature };
}

export function getPayment(order) {
  return withSignature({
    merchant: process.env.MODUL_BANK_ID,
    amount: order.total.toFixed(2),
    order_id: String(order.id),
    custom_order_id: String(order.externalId),
    description: "Тестовый заказ",
    success_url: order.paymentReturnUrl,
    testing: "1",
    client_phone: order.paymentPhone,
    unix_timestamp: String(Math.floor(Date.now() / 1000)),
  });
}

export async function getTransaction(id) {
  const params = withSignature({
    transaction_id: id,
    merchant: process.env.MODUL_BANK_ID,
    unix_timestamp: String(Math.floor(Date.now() / 1000)),
  });

  return api.get("/transaction", {
    params,
  });
}
