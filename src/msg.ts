const CLIENT = Buffer.from([2]);

export function request(
  reqId: string,
  serviceName: string,
  body: string[],
) {
  return ["", CLIENT, reqId, serviceName].concat(body)
}
