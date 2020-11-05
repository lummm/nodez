import { ClientConn } from "../src/index";


async function req(client: ClientConn) {
  const req = [JSON.stringify({hey: "there"})]
                .map((x) => Buffer.from(x));
  return (await client.req("TEST", req))
    .map((b) => b.toString());
}

async function main() {
  const client = new ClientConn("tcp://localhost:9000");
  const results = await Promise.all([1, 2, 3, 4, 5].map(_ => req(client)));
  console.log(results);
}

main();
