export type Frame = string | Buffer;

const WORKER = Buffer.from([1]);
const CLIENT = Buffer.from([2]);

const HEARTBEAT = Buffer.from([1]);
const REPLY = Buffer.from([2]);
const ACK = Buffer.from([3]);

export function request(
  reqId: string,
  serviceName: string,
  body: string[],
): Frame[] {
  return [
    "", CLIENT, reqId, serviceName,
  ].concat(body);
}

export function heartbeat(serviceName: string): Frame[] {
  return worker_msg([HEARTBEAT, serviceName]);
}

export function response(reqId: Buffer, reply: Buffer[]): Frame[] {
  return worker_msg([REPLY, reqId].concat(reply));
}

export function ack(reqId: Buffer): Frame[] {
  return worker_msg([ACK, reqId]);
}

// private
function worker_msg(frames: Frame[]): Frame[] {
  return ["", WORKER].concat(frames);
}
