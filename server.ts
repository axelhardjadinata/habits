import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables (fallback for .env files if present)
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy GoogleGenAI client builder
let aiInstance: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required but missing. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// ==========================================
// API REST ENDPOINTS FOR AI ENGINE FEATURES
// ==========================================

// 1. Sleep/Sunlight Synchronizer
app.post("/api/ai/sleep-sunset", async (req, res) => {
  try {
    const { morningSunlightTime } = req.body;
    if (!morningSunlightTime) {
      return res.status(400).json({ error: "morningSunlightTime is required (Format: HH:MM)." });
    }

    // Try parsing HH:MM
    const matches = morningSunlightTime.match(/^(\d{1,2}):(\d{2})$/);
    if (!matches) {
      return res.status(400).json({ error: "Invalid time format. Please provide HH:MM." });
    }

    let hours = parseInt(matches[1], 10);
    let minutes = parseInt(matches[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return res.status(400).json({ error: "Invalid hours or minutes values." });
    }

    // Programmatic calculation: Set Digital Sunset 14 hours later
    const sunsetHoursVal = (hours + 14) % 24;
    const sunsetPeriod = sunsetHoursVal >= 12 ? "PM" : "AM";
    const sunsetTwelveHour = sunsetHoursVal % 12 === 0 ? 12 : sunsetHoursVal % 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const calculatedSunset = `${sunsetTwelveHour}:${formattedMinutes} ${sunsetPeriod}`;

    const gemini = getGemini();
    const prompt = `The user logs their morning sunlight exposure at artificial/natural light hour ${morningSunlightTime}.
We have automated their 'Digital Sunset' alarm clock for 14 hours later at precisely ${calculatedSunset} to assist circadian sleep alignment.
Generate a cohesive circadian feedback card explaining why this alignment works (serotonin-to-melatonin conversion) and provide specific actionable tips for the sunset preparation starting at ${calculatedSunset}. Utilize a supportive, high-tech tactical gamified hero flavor fitting a Vanguard operator.`;

    const modelResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sunsetTime: { type: Type.STRING, description: "Calculated Digital Sunset time" },
            insight: { type: Type.STRING, description: "Circadian serotonin-to-melatonin alignment rationale" },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable bedtime/evening prep checklist items for consistent cycles",
            },
            environment: { type: Type.STRING, description: "Optimal sleeping environment state change instructions" },
          },
          required: ["sunsetTime", "insight", "tips", "environment"],
        },
      },
    });

    const data = JSON.parse(modelResponse.text || "{}");
    // Ensure the manual sunset matches calculated
    data.sunsetTime = calculatedSunset;

    res.json(data);
  } catch (error: any) {
    console.error("Sleep Synchronizer AI error:", error);
    res.status(500).json({ error: error.message || "Internal AI analysis error." });
  }
});

// 2. Nutrition Analysis (The Rainbow Plate)
app.post("/api/ai/nutrition", async (req, res) => {
  try {
    const { mealDescription, imageBase64, imageMime } = req.body;
    if (!mealDescription && !imageBase64) {
      return res.status(400).json({ error: "Please provide a meal text description or an image." });
    }

    const gemini = getGemini();
    let contents: any[] = [];

    if (imageBase64 && imageMime) {
      contents.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMime,
        },
      });
    }

    const userPromptText = mealDescription 
      ? `Meal prompt/description: ${mealDescription}. Determine if the ingredients meet the tactical "3-Color Rule" (rainbow of vitamin inputs) and analyze what colors are present. Grade vitamin variety and give health instructions for a high-intensity action operator.`
      : `Analyze this image of a meal. Determine the colors present, check if it meets the tactical "3-Color Rule" (rainbow of vitamin inputs), grade the overall vitamin variety and provide nutritional recommendations for an action hero.`;

    contents.push({ text: userPromptText });

    const modelResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colorsDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "The distinct vibrant ingredient colors noticed in this meal (e.g. green, red, yellow)",
            },
            threeColorRuleMet: {
              type: Type.BOOLEAN,
              description: "True if there are 3 or more distinct clean food colors present",
            },
            vitaminVarietyRating: {
              type: Type.STRING,
              description: "Vitamin density letter grade (e.g., Grade A: Highly Diverse, Grade B: Good, Grade C: Lacking Color diversity)",
            },
            nutritionalInsight: {
              type: Type.STRING,
              description: "Summary of dietary benefits, antioxidants, and energetic value for a hero",
            },
            suggestedAdditions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1-3 highly colorful functional foods or ingredients that could enhance this specific meal's color spectrum",
            },
          },
          required: ["colorsDetected", "threeColorRuleMet", "vitaminVarietyRating", "nutritionalInsight", "suggestedAdditions"],
        },
      },
    });

    const data = JSON.parse(modelResponse.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Nutrition analysis AI error:", error);
    res.status(500).json({ error: error.message || "Internal AI analysis error." });
  }
});

// 3. Brain Dump Organizer (The Brain Dump)
app.post("/api/ai/brain-dump", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Please enter your morning brain dump text to organize." });
    }

    const gemini = getGemini();
    const prompt = `The user recorded or wrote this raw, unstructured 'Morning Page' brain dump:
"${text}"

Analyze these stressful thoughts, worries, and clutter. Categorize and convert them into:
1. Short concise actionable "To-Do" checklist tasks.
2. The core recurring mental stressors/triggers noticed.
3. A mindful, supportive focus-tuning coaching sentence in a warm hero/vanguard commander persona.`;

    const modelResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "A sympathetic, high-level summary of the user's mental clutter" },
            actionableTodoList: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3-5 ultra-concrete task items decoupled from emotional anxiety",
            },
            recurringStressors: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Stressor insights or recurring worrying topics detected (e.g., 'Work deadlines', 'Decision fatigue')",
            },
            mindfulCoachingMessage: {
              type: Type.STRING,
              description: "Tactical mindfulness support prompt to fuel clarity and focus",
            },
          },
          required: ["summary", "actionableTodoList", "recurringStressors", "mindfulCoachingMessage"],
        },
      },
    });

    const data = JSON.parse(modelResponse.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Brain Dump Organizer AI error:", error);
    res.status(500).json({ error: error.message || "Internal AI analysis error." });
  }
});

// 4. The Feynman Tutor (The Learning Habit)
app.post("/api/ai/feynman-eval", async (req, res) => {
  try {
    const { topic, explanation } = req.body;
    if (!topic || !explanation) {
      return res.status(400).json({ error: "topic and explanation arguments are required." });
    }

    const gemini = getGemini();
    const prompt = `Feynman Learning Technique Tutor.
Topic: "${topic}"
User Explanation: "${explanation}"

Evaluate if the explaination is clear, accurate, and simple enough for a 5-year-old child to understand (the Feynman method).
Format output with clarity scores, suggestions, missed important facts/concepts, and a beautifully simple replacement model metaphor.`;

    const modelResponse = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clarityScore: { type: Type.INTEGER, description: "Confidence score from 0-100 indicating mastery & simplicity" },
            simplicityRating: { type: Type.STRING, description: "Descriptive label (e.g. Excellent Simplicity, Semi-Complex, Too Technical)" },
            missedConcepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Crucial sub-concepts/details that were omitted or oversimplified under this explanation",
            },
            tutorFeedback: { type: Type.STRING, description: "Direct feedback on why it was clear or where jargon leaked in" },
            revisedExplanationExample: { type: Type.STRING, description: "An alternative visual explanation of the topic using easy-to-understand real-world metaphors (perfect for kids)" },
          },
          required: ["clarityScore", "simplicityRating", "missedConcepts", "tutorFeedback", "revisedExplanationExample"],
        },
      },
    });

    const data = JSON.parse(modelResponse.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Feynman tutor AI error:", error);
    res.status(500).json({ error: error.message || "Internal AI analysis error." });
  }
});

// ==========================================
// STATIC ASSET SERVING & VITE DEVELOPER PROXIES
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for lightning fast development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static outputs
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK VANGUARD SERVER] Listening securely at http://localhost:${PORT}`);
  });
}

startServer();
