import type { NextApiRequest, NextApiResponse } from "next";
import Redis from "ioredis";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron_key } = req.query;
  if (cron_key !== process.env.CRON_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const runtime = await randomRunDuration();
  await setLastRan();

  res.status(200).json({
    step: "process",
    success: 1,
    message: "Ran Successfully for " + runtime + " seconds.",
    datetime: new Date().toISOString(),
  });
  return;
}

function randomRunDuration() {
  const seconds = Math.floor(Math.random() * 10) + 1;
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(seconds);
    }, seconds * 1000);
  });
}

async function setLastRan() {
  try {
    const config = {
      host: process.env.REDIS_HOST,
      port: 6379,
      user: "default",
      password: process.env.REDIS_PASSWORD,
    };
    const client = new Redis(
      `rediss://${config.user}:${config.password}@${config.host}:${config.port}`,
      { maxRetriesPerRequest: 3 }
    );

    await client.set("lastRan", new Date().toISOString());
  } catch (error) {
    console.log(error);
  }
}
