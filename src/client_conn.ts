import * as crypto from "crypto";

import * as zmq from "zeromq";

import * as msg from "./msg";


const DEFAULT_TIMEOUT = 5000
const TIMEOUT_RESPONSE = [Buffer.from("EZ_ERR"), Buffer.from("TIMEOUT")];


export class ClientConn {

  private id: string = Date.now().valueOf().toString();
  private dealer: zmq.Dealer;
  private responseHandlers = new Map();

  constructor(
    private connectStr: string
  ) {
    this.dealer = new zmq.Dealer({
      routingId: this.id,
    });
    this.dealer.connect(this.connectStr);
    console.info(`dealer connected to ${this.connectStr}`);
    this.setupListen();
  }

  public req(
    serviceName: string,
    body: string[],
    timeout: number = DEFAULT_TIMEOUT,
  ): Promise<Buffer[]> {
    return new Promise(async (resolve, reject) => {
      const reqId = await this.getReqId();
      const timeoutHandle = setTimeout(() => {
        if (this.responseHandlers.has(reqId)) {
          this.responseHandlers.delete(reqId);
          resolve(TIMEOUT_RESPONSE);
        }
      }, timeout);
      this.responseHandlers.set(reqId, (response: Buffer[]) => {
        clearTimeout(timeoutHandle);
        resolve(response);
      });
      await this.dealer.send(msg.request(reqId, serviceName, body));
    });
  }

  private setupListen(): void {
    const onMsg = (frames: Buffer[]) => {
      const reqId = frames[1].toString();
      const response = frames.slice(2);
      const cb = this.responseHandlers.get(reqId);
      if (!cb) {
        console.log(`bad req id - `, reqId);
      } else {
        this.responseHandlers.delete(reqId);
        cb(response);
      }
      this.dealer.receive().then(onMsg);
    }
    this.dealer.receive().then(onMsg);
  }

  private getReqId(): Promise<string> {
    return new Promise((res, rej) => {
      crypto.randomBytes(8, (err, buffer) => {
        res(buffer.toString("hex"));
      })
    });
  }
}
