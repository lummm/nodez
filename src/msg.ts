const WORKER = Buffer.from([1]);
const CLIENT = Buffer.from([2]);

const HEARTBEAT = Buffer.from([1]);
const REPLY = Buffer.from([2]);
const ACK = Buffer.from([3]);

export function request(
  reqId: string,
  serviceName: string,
  body: Buffer[],
): Buffer[] {
  return [
    Buffer.from(""), CLIENT, Buffer.from(reqId), Buffer.from(serviceName),
  ].concat(body);
}

export function heartbeat(serviceName: string): Buffer[] {
  return worker_msg([HEARTBEAT, Buffer.from(serviceName)]);
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
