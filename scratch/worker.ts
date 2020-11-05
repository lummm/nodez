import { WorkerConn } from "../src/index";


async function handler(frames: Buffer[]): Promise<Buffer[]> {
  const req = frames.map((x) => x.toString());
  console.log("got req", req);
  return await new Promise((res, rej) => {
    setTimeout(() => {
      const response = ["OK", JSON.stringify("hey!")]
                         .map((x) => Buffer.from(x));
      res(response);
    }, 2000);
  });
}


async function main() {
  const worker = new WorkerConn(
    "tcp://localhost:9004",
    Buffer.from("TEST"),
    2000,
    50,
  );
  worker.serve(handler);
}

main();
