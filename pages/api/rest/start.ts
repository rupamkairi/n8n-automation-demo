import { differenceInSeconds } from "date-fns";
import Redis from "ioredis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { cron_key } = req.query;
  if (cron_key !== process.env.CRON_KEY) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const startAt: Date = new Date(req.query.startAt as string);
  const lastRan = new Date((await getLastRan()) as string);
  console.log({ startAt, lastRan });
  const diffSeconds = differenceInSeconds(startAt, lastRan);
  console.log({ diffSeconds });
  if (diffSeconds < 30) {
    res.status(200).json({
      step: "start",
      success: 0,
      message: "Ran too soon.",
      datetime: new Date().toISOString(),
    });
  }

  res.status(200).json({
    step: "start",
    success: 1,
    message: "Ran Successfully.",
    datetime: new Date().toISOString(),
  });
  return;
}

async function getLastRan() {
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

    const lastRan = await client.get("lastRan");
    return lastRan;
  } catch (error) {
    console.log(error);
  }
}
