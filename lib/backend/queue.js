import { v4 as uuid } from "uuid";
import defer from "lodash/defer";
import aws from "aws-sdk";
import get from "lodash/get";
import pick from "lodash/pick";
import range from "lodash/range";
import groupBy from "lodash/groupBy";
import constant from "lodash/constant";

const min = (count = 1) => ({
  min: constant(count),
  sec: constant(count * 60),
  mil: constant(count * 60 * 1000),
});

const sec = (count = 1) => ({
  min: constant(count / 60),
  sec: constant(count),
  mil: constant(count * 1000),
});

const mil = (count = 1) => ({
  min: constant(count / 60 / 1000),
  sec: constant(count / 1000),
  mil: constant(count),
});

const receiveTimeout = min(10); // cooldown
const handleTimeout = sec(5); // время невидимости после получения сообщения
const unclaimedTimeout = sec(10); // время невидимости после возврата сообщения в очередь
const waitTimeout = sec(10); // время лонгполлинга при получении сообщений

const queue = new aws.SQS({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_QUEUE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

let timer = null;

const subscribers = new Map();

function runHandler(message, handler) {
  try {
    const data = JSON.parse(get(message, "Body", "{}"));
    const type = get(data, "type");

    return handler(type, data, message);
  } catch (_) {
    return false;
  }
}

async function runHandlers(message, handlers) {
  const results = await Promise.all(
    handlers.map((handler) => runHandler(message, handler))
  );

  return results.every(Boolean);
}

async function watch() {
  try {
    const result = await queue
      .receiveMessage({
        QueueUrl: process.env.AWS_QUEUE_URL,
        WaitTimeSeconds: waitTimeout.sec(),
        VisibilityTimeout: handleTimeout.sec(),
      })
      .promise();

    const messages = get(result, "Messages", []);
    const handlers = Array.from(subscribers.values());

    const results = await Promise.all(
      messages.map((message) => runHandlers(message, handlers))
    );

    const { deletes = [], returns = [] } = groupBy(
      range(messages.length),
      (index) =>
        results[index] ||
        parseInt(
          get(messages[index], ["Attributes", "ApproximateReceiveCount"], 0),
          10
        ) >= 5
          ? "deletes"
          : "returns"
    );

    const deleteEntries = deletes.map((index) => ({
      Id: uuid(),
      ReceiptHandle: messages[index].ReceiptHandle,
    }));

    const returnEntries = returns.map((index) => ({
      Id: uuid(),
      VisibilityTimeout: unclaimedTimeout.sec(),
      ReceiptHandle: messages[index].ReceiptHandle,
    }));

    await Promise.all([
      deletes.length > 0
        ? queue
            .deleteMessageBatch({
              QueueUrl: process.env.AWS_QUEUE_URL,
              Entries: deleteEntries,
            })
            .promise()
        : Promise.resolve(),
      returns.length > 0
        ? queue
            .changeMessageVisibilityBatch({
              QueueUrl: process.env.AWS_QUEUE_URL,
              Entries: returnEntries,
            })
            .promise()
        : Promise.resolve(),
    ]);
  } catch (_) {
  } finally {
    if (timer !== null) {
      timer = setTimeout(watch, receiveTimeout.mil());
    }
  }
}

function checkWatching() {
  if (subscribers.size > 0) {
    if (timer === null) {
      timer = defer(watch);
    }
  } else {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }
}

export async function send(message) {
  const result = await queue
    .sendMessage({
      QueueUrl: process.env.AWS_QUEUE_URL,
      MessageBody: JSON.stringify(message),
    })
    .promise();

  return result;
}

export async function sendOrder(order) {
  await send({
    type: "deluxspa-new-order",
    order: pick(order, ["id", "fio", "phone", "email", "total"]),
  });
}

export async function sendOrderStatus(id, status) {
  await send({
    id,
    status,
    type: "deluxspa-new-order-status",
  });
}

export async function sendInactiveOrders(orders) {
  await send({
    orders,
    type: "deluxspa-inactive-orders",
  });
}

export async function sendFeedback(key) {
  await send({
    key,
    type: "deluxspa-new-feedback",
  });
}

export async function sendPassword(name, key, entity, uid) {
  await send({
    key,
    uid,
    name,
    entity,
    type: "deluxspa-password-update",
  });
}

export function subscribe(subscriber) {
  const id = uuid();

  subscribers.set(id, subscriber);

  defer(checkWatching);

  return function () {
    subscribers.delete(id);

    defer(checkWatching);
  };
}
