import aws from "aws-sdk";

const queue = new aws.SQS({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function sendSignupEmail(email, url) {
  await queue
    .sendMessage({
      QueueUrl: process.env.AWS_MESSAGE_QUEUE_URL,
      MessageBody: JSON.stringify({ type: "signup", email, url }),
    })
    .promise();
}

export default queue;
