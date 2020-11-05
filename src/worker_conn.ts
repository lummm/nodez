import * as crypto from "crypto";

import * as zmq from "zeromq";

import * as msg from "./msg";


type Handler = (frames: Buffer[]) => Promise<Buffer[]>;


export class WorkerConn {

  private id: string = crypto.randomFillSync(Buffer.alloc(8)).toString();
  private dealer: zmq.Dealer;
  private heartbeatTimer: NodeJS.Timeout;
  private tasks = new Map();
  private handler: Handler;

  constructor(
    private connectStr: string,
    private serviceName: string,
    private liveliness: number,
    private maxConcurrentTasks: number,
  ) {
    this.dealer = new zmq.Dealer({
      routingId: this.serviceName + "-" + this.id,
    });
    this.dealer.connect(this.connectStr);
    console.info("worker dealer connected to ", this.connectStr);
    this.setupHeartbeat();
  }

  public serve(handler: Handler) {
    this.handler = handler;
    this.setupWorkListen();
  }

  private setupHeartbeat(): void {
    const doHeartbeat = async () => {
      await this.dealer.send(msg.heartbeat(this.serviceName));
    };
   this.heartbeatTimer = setInterval(doHeartbeat, this.liveliness);
  }

  private setupWorkListen(): void {
    const onWork = (frames: Buffer[]) => {
      const reqId = frames[1];
      const body = frames.slice(2);
      this.handleWork(reqId, body);
      this.dealer.receive().then(onWork);
    };
    this.dealer.receive().then(onWork);
  }

  private async handleWork(reqId: Buffer, body: Buffer[]) {
    if (this.maxConcurrentTasks <= this.tasks.size) {
      // we can't take on work
      return;
    }
    await this.dealer.send(msg.ack(reqId));
    const timerHandle = setTimeout(async () => {
      const response = await this.handler(body);
      await this.dealer.send(msg.response(reqId, response));
      this.tasks.delete(timerHandle);
    });
    this.tasks.set(timerHandle, true);
  }
}
