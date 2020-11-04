FROM nodez-build:dev

WORKDIR /test
RUN npm install -g ts-node
COPY ./package.json ./package.json
RUN npm link nodez

COPY ./basic_test.ts ./basic_test.ts

RUN ts-node ./basic_test.ts
