import { resolve } from "path";
import { loadPackageDefinition, credentials } from "@grpc/grpc-js";
import { load } from "@grpc/proto-loader";
import asyncInit from "@ert78gb/async-init";

const initter = asyncInit();

async function initProto() {
  const definitions = await load(
    resolve(process.cwd(), "lib", "backend", "protos", "cdek.proto")
  );

  const cdekProto = loadPackageDefinition(definitions);

  return new cdekProto.Cdek("0.0.0.0:50051", credentials.createInsecure());
}

async function toArray(stream) {
  const result = [];

  for await (const value of stream) {
    result.push(value);
  }

  return result;
}

export async function getCdekCities(name) {
  const cdek = await initter(initProto);

  return toArray(cdek.getCities({ name }));
}
