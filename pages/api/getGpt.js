import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text, history } = req.query;

  if (!text) {
    return res.status(400).json({ error: "Input query parameter is required" });
  }

  const parsedHistory = history ? JSON.parse(history) : [];

  const prompt = `
  ${text} 키워드에 대한 한국어 인터렉티브 스토리를 하나만 생성해줘. 아래 예시처럼 양식을 지켜서 제목, 내용, 선택지를 만들어줘.
  #예시1
  - 제목: 모험 가득한 여름 방학
  - 내용: 아이들이 기다리고 기다리던 여름 방학이 시작되었어요! 뜨거운 여름 햇살 아래서 친구들과 무슨 모험을 떠날까요?
  - 1. 친구들과 함께 해변으로 떠나기
  - 2. 산 속에서 캠핑하기
  - 3. 도심 속 워터파크 즐기기

  #예시2
  - 제목: 특별한 어린이날 이야기
  - 내용: 오늘은 어린이날! 정말 기대되고 설레는 날이야. 이번 어린이날은 특별하게 보내고 싶어. 무엇을 하면 좋을까?
  - 1. 놀이공원에서 즐기는 하루
  - 2. 집에서 가족과 함께 카네이션 만들기
  - 3. 친구들과 미술관 탐방하기
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [...parsedHistory, { role: "system", content: prompt }],
      max_tokens: 2000,
    });

    let response = completion.choices[0].message.content.trim();
    console.log(response);

    res.status(200).json({ res: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error" });
  }
}
