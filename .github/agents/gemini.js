const { GoogleGenerativeAI } = require("@google/generative-ai");

// Masukkan API Key kamu di sini atau gunakan process.env.GEMINI_API_KEY
const API_KEY = "PASTE_API_KEY_KAMU_DISINI"; 
const genAI = new GoogleGenerativeAI(API_KEY);

async function askGemini() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = process.argv.slice(2).join(" ");

  if (!prompt) {
    console.error("❌ Masukkan pertanyaan! Contoh: node gemini.js 'cara buat middleware di laravel'");
    return;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log("\n🤖 Gemini:\n", response.text());
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

askGemini();
