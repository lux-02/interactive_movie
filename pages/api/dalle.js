import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: "Input query parameter is required" });
  }

  try {
    const completion = await openai.images.generate({
      model: "dall-e-3",
      prompt: `${text}`,
      n: 1,
      size: "1024x1024",
    });

    let response = completion.data[0].url;
    console.log(response);

    res.status(200).json({ res: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error" });
  }
}
