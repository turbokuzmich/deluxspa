import fs from "fs";
import get from "lodash/get";
import { promisify } from "util";
import { resolve } from "path";

const filePath = resolve(process.cwd(), "session.json");

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const sessionStore = {
  async get(sid) {
    return get(JSON.parse(await readFile(filePath, "utf-8")), sid);
  },
  async set(sid, session) {
    const data = JSON.parse(await readFile(filePath, "utf-8"));

    data[sid] = session;

    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  },
  async destroy(sid) {
    const data = JSON.parse(await readFile(filePath, "utf-8"));

    delete data[sid];

    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  },
  async touch(sid, session) {
    const data = JSON.parse(await readFile(filePath, "utf-8"));

    data[sid] = session;

    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
  },
};

export default sessionStore;
