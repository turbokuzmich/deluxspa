import aws from "aws-sdk";
import { formatRU } from "../helpers/date";

const s3 = new aws.S3({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function getNeonBeardCatalogs(locale = "ru") {
  const { Contents } = await s3
    .listObjects({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: `catalog/neon-beard/${locale}`,
    })
    .promise();

  return [...Contents]
    .reverse()
    .slice(0, 5)
    .map(({ Key, LastModified }) => [
      {
        text: formatRU(LastModified),
        url: `https://${process.env.AWS_S3_BUCKET_NAME}.storage.yandexcloud.net/${Key}`,
      },
    ]);
}

export async function uploadNeonBeardCatalog(stream, locale, progressHandler) {
  const key = `catalog/neon-beard/${locale}/${Date.now()}`;

  const upload = s3.upload({
    Body: stream,
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    ContentType: "application/pdf",
    Key: key,
  });

  upload.on("httpUploadProgress", progressHandler);

  const { Location, Key } = await upload.promise();

  const { LastModified } = await s3
    .headObject({
      Key,
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    })
    .promise();

  return { key, location: Location, date: LastModified };
}

export default s3;
