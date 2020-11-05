import { ClientConn, WorkerConn } from "nodez";


const client = new ClientConn("tcp://localhost:5555");
const worker = new WorkerConn(
  "tcp://localhost:5554",
  Buffer.from("TEST"),
  2000,
  50
);

process.exit();
