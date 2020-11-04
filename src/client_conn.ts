import * as crypto from "crypto";

import * as zmq from "zeromq";

import * as msg from "./msg";


const DEFAULT_TIMEOUT = 5000


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
      await this.dealer.send(msg.request(reqId, serviceName, body));
      this.responseHandlers.set(reqId, (response: Buffer[]) => {
        resolve(response);
      });
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
