// src/utils/api.js - Martyrs SchoolTrack Gemini Connector

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;

// Local fallback bank - stops blank page
const FALLBACK_BANK = {
  Mathematics: [
    { q: "What is 12 x 8?", options: ["86", "96", "108", "88"], answer: "B" },
    { q: "Find the value of x: 2x + 5 = 15", options: ["5", "10", "7", "3"], answer: "A" },
  ],
  English: [
    { q: "Choose the correct noun: The ___ are playing", options: ["child", "children", "childs", "childrens"], answer: "B" },
  ],
  Default: [
    { q: "What is the main topic?", options: ["A", "B", "C", "D"], answer: "A" },
  ]
};

function getFallback(subject, count) {
  const bank = FALLBACK_BANK[subject] || FALLBACK_BANK.Default;
  // Shuffle and pick unique
  const shuffled = [...bank].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((item, i) => ({
    id: i + 1,
    question: item.q,
    options: item.options,
    answer: item.answer,
    marks: 2
  }));
}

export async function generateExamWithGemini({ subject, classLevel, topics, numObjectives = 30, numTheory = 3, difficulty = "GES Standard", randomized = true }) {

  // If no key, use fallback immediately
  if (!GEMINI_KEY) {
    console.warn("No Gemini Key found, using local bank");
    return {
      objectives: getFallback(subject, numObjectives),
      theory: [{ id: 1, question: `Explain ${topics}`, marks: 40 }],
      answerKey: [],
      source: "local"
    };
  }

  const prompt = `
You are a GES examiner for Ghana Basic School.
Class: ${classLevel}
Subject: ${subject}
Topics: ${topics}
Difficulty: ${difficulty}

TASK:
Generate ${numObjectives} UNIQUE objective questions and ${numTheory} theory questions.
RULES - VERY IMPORTANT:
- Subject must match questions. If Mathematics, only calculation/problem solving. If English, only grammar/comprehension. If Science, only science facts. If RME, only religion/morals. NEVER mix.
- No repeating questions or options.
- Options must be vertical A, B, C, D and randomized: ${randomized? "YES randomize answers" : "NO"}
- Objective = 2 marks each, Theory share 40 marks to total 100%
- Theory questions must be GES standard.

Return ONLY valid JSON like this:
{
  "objectives": [{ "id": 1, "question": "...", "options": ["A...", "B...", "C...", "D..."], "answer": "B", "marks": 2 }],
  "theory": [{ "id": 1, "question": "...", "marks": 13.33 }],
  "answerKey": [{ "id": 1, "answer": "B", "explanation": "..." }]
}
No extra text outside JSON.
`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
      })
    });

    const data = await response.json();

    if (!data.candidates) throw new Error("Gemini quota or key error");

    let text = data.candidates[0].content.parts[0].text;
    // Clean markdown ```json wrapper
    text = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    console.log("Using Gemini");
    return {...parsed, source: "gemini" };

  } catch (error) {
    console.error("Gemini failed, using fallback:", error);
    return {
      objectives: getFallback(subject, numObjectives),
      theory: [{ id: 1, question: `Explain ${topics} in detail`, marks: 40 }],
      answerKey: [],
      source: "local-fallback"
    };
  }
}