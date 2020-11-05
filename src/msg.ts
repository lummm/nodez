const WORKER = Buffer.from([1]);
const CLIENT = Buffer.from([2]);

const HEARTBEAT = Buffer.from([1]);
const REPLY = Buffer.from([2]);
const ACK = Buffer.from([3]);

export function request(
  reqId: Buffer,
  serviceName: Buffer,
  body: Buffer[],
): Buffer[] {
  return [
    Buffer.from(""),
    CLIENT,
    reqId,
    serviceName,
  ].concat(body);
}

export function heartbeat(serviceName: Buffer): Buffer[] {
  return worker_msg([HEARTBEAT, serviceName]);
}

export function response(reqId: Buffer, reply: Buffer[]): Buffer[] {
  return worker_msg([REPLY, reqId].concat(reply));
}

export function ack(reqId: Buffer): Buffer[] {
  return worker_msg([ACK, reqId]);
}

// private
function worker_msg(frames: Buffer[]): Buffer[] {
  return [Buffer.from(""), WORKER].concat(frames);
}
