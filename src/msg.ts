export type Frame = string | Buffer;

const CLIENT = Buffer.from([2]);

export function request(
  reqId: string,
  serviceName: string,
  body: string[],
): Frame[] {
  return [
    "", CLIENT, reqId, serviceName
  ].concat(body);
}
