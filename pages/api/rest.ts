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

  res.status(200).json({
    name: "John Doe",
    datetime: new Date().toISOString(),
  });
  return;
}
