import { WorkerConn } from "../src/worker_conn";


async function handler(frames: Buffer[]) {
  const req = frames.map((x) => x.toString());
  console.log("got req", req);
  return await new Promise((res, rej) => {
    setTimeout(() => {
      res(["OK", JSON.stringify("hey!")]);
    }, 2000);
  });
}


async function main() {
  const worker = new WorkerConn(
    "tcp://localhost:9004",
    "TEST",
    2000,
    2,
  );
  worker.serve(handler);
}

main();
