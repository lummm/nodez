import * as crypto from "crypto";

import * as zmq from "zeromq";

import * as msg from "./msg";


const DEFAULT_TIMEOUT = 5000
const TIMEOUT_RESPONSE = [Buffer.from("EZ_ERR"), Buffer.from("TIMEOUT")];


export class ClientConn {

  private id: string = crypto.randomFillSync(Buffer.alloc(8)).toString("hex");
  private dealer: zmq.Dealer;
  private responseHandlers = new Map();

  constructor(
    private connectStr: string
  ) {
    this.dealer = new zmq.Dealer({
      routingId: this.id,
    });
    this.dealer.connect(this.connectStr);
    console.info(`client dealer connected to ${this.connectStr}`);
    this.setupListen();
  }

  public req(
    serviceName: Buffer,
    body: Buffer[],
    timeout: number = DEFAULT_TIMEOUT,
  ): Promise<Buffer[]> {
    return new Promise(async (resolve, reject) => {
      const reqId = await this.getReqId();
      const reqIdHex = reqId.toString("hex");
      const timeoutHandle = setTimeout(() => {
        if (this.responseHandlers.has(reqIdHex)) {
          this.responseHandlers.delete(reqIdHex);
          resolve(TIMEOUT_RESPONSE);
        }
      }, timeout);
      this.responseHandlers.set(reqIdHex, (response: Buffer[]) => {
        clearTimeout(timeoutHandle);
        resolve(response);
      });
      await this.dealer.send(msg.request(reqId, serviceName, body));
    });
  }

  private setupListen(): void {
    const onMsg = (frames: Buffer[]) => {
      const reqId = frames[1];
      const reqIdHex = reqId.toString("hex");
      const response = frames.slice(2);
      const cb = this.responseHandlers.get(reqIdHex);
      if (!cb) {
        console.info(`no handler for req id, possible timeout -`,
                     reqId.toString("hex"));
      } else {
        this.responseHandlers.delete(reqIdHex);
        cb(response);
      }
      this.dealer.receive().then(onMsg);
    }
    this.dealer.receive().then(onMsg);
  }

  private getReqId(): Promise<Buffer> {
    return new Promise((res, rej) => {
      crypto.randomBytes(8, (err, buffer) => {
        res(buffer);
      })
    });
  }
}
