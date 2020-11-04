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
  ): Promise<any> {
    return new Promise(async (resolve, reject) => {
      const reqId = await this.getReqId();
      await this.dealer.send(msg.request(reqId, serviceName, body));
      resolve("OK");
    });
  }

  private setupListen(): void {
    const onMsg = (msg) => {
      // figure out req id, call its handler
      const reqId = "1";
      console.log(`got response ${msg}`);
      if (!this.responseHandlers.has(reqId)) {
        console.log(`bad req id ${reqId}`);
      } else {
        const cb = this.responseHandlers.get(reqId);
        this.responseHandlers.delete(reqId);
        cb(msg);
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
