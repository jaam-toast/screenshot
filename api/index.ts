import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

import { getScreenshot } from "./_lib/puppeteer";

import type { FastifyRequest } from "fastify";

dotenv.config();

function checkUrl(string: string) {
  try {
    new URL(string);
  } catch (error) {
    return false;
  }

  return true;
}

const fastify = Fastify({
  logger: true,
});

console.log(process.env.CLIENT_URL);

(async () =>
  await fastify.register(cors, {
    origin: process.env.CLIENT_URL,
    credentials: true,
  }))();

type GetScreenshotRequest = FastifyRequest<{
  Querystring: {
    url: string;
    width?: string;
    height?: string;
  };
}>;

fastify.get("/", async (request: GetScreenshotRequest, reply) => {
  const { url, width, height } = request.query;

  if (!url) {
    return reply.status(400).send("No url query specified.");
  }
  if (!checkUrl(url)) {
    return reply.status(400).send("Invalid url query specified.");
  }

  try {
    const file = await getScreenshot({
      url,
      ...(width ? { width: Number(width) } : {}),
      ...(height ? { height: Number(height) } : {}),
    });
    reply.header("Content-Type", "image/png");
    reply.header(
      "Cache-Control",
      "public, immutable, no-transform, s-maxage=86400, max-age=86400"
    );
    reply.status(200).send(file);
  } catch (error) {
    console.log(error);
    reply
      .status(500)
      .send(
        "The server encountered an error. You may have inputted an invalid query."
      );
  }
});

fastify.listen({ port: 9000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  fastify.log.info(`Server is now listening on ${address}`);
});
