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
// PROGRAMMATIC FALLBACK ANALYZERS (FAIL-SAFE)
// ==========================================

function evaluateSleepSunsetProgrammatically(morningSunlightTime: string) {
  // Try parsing HH:MM
  const matches = morningSunlightTime.match(/^(\d{1,2}):(\d{2})$/);
  let hours = 8;
  let minutes = 0;
  if (matches) {
    hours = parseInt(matches[1], 10);
    minutes = parseInt(matches[2], 10);
  }
  const sunsetHoursVal = (hours + 14) % 24;
  const sunsetPeriod = sunsetHoursVal >= 12 ? "PM" : "AM";
  const sunsetTwelveHour = sunsetHoursVal % 12 === 0 ? 12 : sunsetHoursVal % 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const calculatedSunset = `${sunsetTwelveHour}:${formattedMinutes} ${sunsetPeriod}`;

  return {
    sunsetTime: calculatedSunset,
    insight: `Exposing your eyes to sunlight at ${morningSunlightTime} triggers a natural 14-hour biological timer. This biological clock suppresses melatonin (the sleep hormone) in the morning while building pressure for high-quality serotonin, which will synthesize back into melatonin precisely around ${calculatedSunset} for standard deep sleep prep, satisfying circadian synchronization.`,
    tips: [
      `Power down high-contrast glowing displays and monitors by ${calculatedSunset} to prevent blue-light eye stress.`,
      `Lower ambient illumination throughout your tactical living quarters or study zone.`,
      `Engage in non-stimulating cerebral activity such as reading or stretching to signal physical decompression.`
    ],
    environment: "Ensure your primary resting zone has a cooling ambient temperature (65-68°F / 18-20°C) and activate total blackout shields to maximize sleep restoration cycles."
  };
}

function evaluateNutritionProgrammatically(mealDescription: string) {
  const text = (mealDescription || "").toLowerCase();
  const colors: string[] = [];
  
  if (text.includes("green") || text.includes("spinach") || text.includes("broccoli") || text.includes("lettuce") || text.includes("avocado") || text.includes("cucumber") || text.includes("kale")) {
    colors.push("Green");
  }
  if (text.includes("red") || text.includes("tomato") || text.includes("apple") || text.includes("strawberry") || text.includes("pepper") || text.includes("beef")) {
    colors.push("Red");
  }
  if (text.includes("yellow") || text.includes("orange") || text.includes("banana") || text.includes("lemon") || text.includes("carrot") || text.includes("egg") || text.includes("corn")) {
    colors.push("Yellow/Orange");
  }
  if (text.includes("blue") || text.includes("purple") || text.includes("blueberry") || text.includes("grape") || text.includes("eggplant")) {
    colors.push("Blue/Purple");
  }
  if (text.includes("white") || text.includes("rice") || text.includes("potato") || text.includes("chicken") || text.includes("milk") || text.includes("onion")) {
    colors.push("White");
  }
  
  // Default if no color keyword is found
  if (colors.length === 0) {
    colors.push("Green", "Yellow/Orange");
  }
  
  const met = colors.length >= 3;
  const rating = met ? "Grade A: Highly Diverse" : colors.length === 2 ? "Grade B: Good Variety" : "Grade C: Lacking Color Diversity";
  
  return {
    colorsDetected: colors,
    threeColorRuleMet: met,
    vitaminVarietyRating: rating,
    nutritionalInsight: `Your meal contains key bio-elements supporting core vitality. ${met ? "Excellent color dispersion means you are getting an array of different antioxidants." : "Enhancing the color spectrum would amplify your immune defenses and daily energy output."}`,
    suggestedAdditions: [
      "A handful of organic fresh spinach or kale leaves (adds high-grade dietary iron and Green chlorophyll)",
      "Vibrant cherry tomatoes or bell peppers (provides high-concentration Vitamin C and Red lycopene)",
      "Wild ripe blueberries (provides premium brain-boosting Blue anthocyanins)"
    ]
  };
}

function evaluateBrainDumpProgrammatically(text: string) {
  // Extract simple sentence pieces or clauses
  const lines = text.split(/[.,?!;]+/).map(s => s.trim()).filter(s => s.length > 5);
  const actionable: string[] = [];
  const stressorsList: string[] = [];
  
  const lowerText = text.toLowerCase();
  
  // Stressors check
  if (lowerText.includes("work") || lowerText.includes("boss") || lowerText.includes("project") || lowerText.includes("deadline")) {
    stressorsList.push("Professional responsibilities and work deadline pressure");
  }
  if (lowerText.includes("tired") || lowerText.includes("sleep") || lowerText.includes("exhausted") || lowerText.includes("wake")) {
    stressorsList.push("Physical fatigue and disrupted circadian recovery");
  }
  if (lowerText.includes("money") || lowerText.includes("buy") || lowerText.includes("rent") || lowerText.includes("pay")) {
    stressorsList.push("Financial resource allocation concerns");
  }
  if (lowerText.includes("friend") || lowerText.includes("him") || lowerText.includes("her") || lowerText.includes("they") || lowerText.includes("meet")) {
    stressorsList.push("Social interaction dynamics and communication overhead");
  }
  
  if (stressorsList.length === 0) {
    stressorsList.push("Undefined mental clutter and general daily administrative stress");
  }
  
  // Transform clauses to tasks
  lines.forEach((line, i) => {
    if (i < 4) {
      actionable.push(`Deconstruct issues: Address "${line.substring(0, 45)}${line.length > 45 ? '...' : ''}" step-by-step.`);
    }
  });
  
  if (actionable.length === 0) {
    actionable.push(
      "Organize prioritized workspaces and clear physical physical clutter.",
      "Execute high-priority items sequentially.",
      "Take a structured 5-minute breathing break."
    );
  }
  
  return {
    summary: "Your brain dump indicates active thoughts relating to multiple personal responsibilities. Sorting this raw input allows us to isolate stressors and formulate targeted actionable checklists.",
    actionableTodoList: actionable.slice(0, 4),
    recurringStressors: stressorsList,
    mindfulCoachingMessage: "Vanguard, prioritize deep inhales and take control of the current hour. Focus exclusively on the very first items of the actionable list. One mission step at a time."
  };
}

function evaluateFeynmanProgrammatically(topic: string, explanation: string) {
  const lowercaseExp = explanation.toLowerCase();
  const lowercaseTopic = topic.toLowerCase();
  
  // List of jargon/complex terms that 5-year-olds wouldn't understand
  const jargonTerms = [
    "framework", "predicated", "decentralization", "accumulation", "sequestered", "telemetry", "socio-economic",
    "utilize", "methodology", "infrastructure", "paradigm", "juxtaposition", "epistemology", "synergy",
    "leverage", "optimization", "synthesize", "implementation", "architectural", "concept", "cognitive",
    "quantum", "cryptography", "photosynthesis", "decentralized", "blockchain", "protocols", "algorithms"
  ];
  
  // Detect jargon count
  let jargonCount = 0;
  const foundJargon: string[] = [];
  jargonTerms.forEach(term => {
    if (lowercaseExp.includes(term)) {
      jargonCount++;
      foundJargon.push(term);
    }
  });

  // Calculate word density and sentence lengths
  const words = explanation.split(/\s+/).filter(w => w.length > 0);
  const sentenceCount = explanation.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const avgSentenceLength = words.length / sentenceCount;
  
  // Count long words (> 8 chars)
  const longWords = words.filter(w => w.replace(/[^a-zA-Z]/g, '').length > 8);
  const longWordRatio = words.length > 0 ? longWords.length / words.length : 0;
  
  // Scoring formula: starts at 95, reduced by Jargon count and sentence length
  let clarityScore = 95;
  clarityScore -= jargonCount * 8;
  if (avgSentenceLength > 15) {
    clarityScore -= Math.min(15, (avgSentenceLength - 15) * 1.5);
  }
  if (longWordRatio > 0.15) {
    clarityScore -= Math.min(15, (longWordRatio - 0.15) * 100 * 0.5);
  }
  
  clarityScore = Math.max(10, Math.min(100, Math.round(clarityScore)));
  
  // Determine simplicity label
  let simplicityRating = "Excellent Simplicity";
  let tutorFeedback = "";
  let revisedExplanationExample = "";
  let missedConcepts: string[] = [];
  
  if (clarityScore >= 80) {
    simplicityRating = "Excellent Simplicity";
    tutorFeedback = `Brilliant work! Your explanation of "${topic}" uses wonderfully simple, tactile metaphors. By avoiding heavy academic terminology, you've made the concept extremely approachable. An excellent illustration of the Feynman technique.`;
  } else if (clarityScore >= 55) {
    simplicityRating = "Semi-Complex / Intermediate";
    tutorFeedback = `Good effort, but some technical friction remains. Words like ${foundJargon.slice(0, 2).map(j => `"${j}"`).join(" and ")} or slightly long structures make it a bit dense for a 5-year-old child. Try breaking down the concepts into everyday objects!`;
  } else {
    simplicityRating = "Too Technical / Overly Jargony";
    tutorFeedback = `Your explanation is saturated with academic jargon or dense terminology (e.g. ${foundJargon.slice(0, 3).map(j => `"${j}"`).join(", ")}). A 5-year-old would quickly lose interest or understanding. Focus on physical analogies, play, and sensory comparisons.`;
  }
  
  // Generate a customized metaphor explanation based on common topics
  if (lowercaseTopic.includes("quantum")) {
    revisedExplanationExample = "Think of a normal computer like a train that can only travel on one track at a time to find the end of a maze. A quantum computer is a magic train that can split into lots of ghost trains and explore all paths of the maze at the exact same time!";
    missedConcepts = ["Superposition", "Qubits", "Quantum Entanglement"];
  } else if (lowercaseTopic.includes("capitalism")) {
    revisedExplanationExample = "Imagine a giant playground game where any kid can make their own lemonade stand. If you make yummy lemonade, other kids will give you shiny stickers for it. You own your stand, and you can use your stickers to build an even bigger stand!";
    missedConcepts = ["Market decentralization", "Private ownership", "Supply and demand dynamics"];
  } else if (lowercaseTopic.includes("photosynthesis")) {
    revisedExplanationExample = "Plants have tiny green kitchens inside their leaves. They take sunlight, sip some water from the dirt, and breathe in the air to cook sweet plant-food (sugar) to help them grow big and strong, then puff out clean fresh air for us to breathe!";
    missedConcepts = ["Chloroplasts / Chlorophyll", "Carbon Dioxide absorption", "Chemical conversion of ATP"];
  } else if (lowercaseTopic.includes("black hole")) {
    revisedExplanationExample = "A black hole is like a giant, invisible vacuum cleaner in outer space. It is so strong that if anything gets too close—even a beam of light—it gets sucked inside and can never, ever wiggle its way back out!";
    missedConcepts = ["Event Horizon", "Gravitational Singularity", "Spaghettification"];
  } else {
    // General fallback topic
    revisedExplanationExample = `Think of ${topic} like a tiny team of busy ants in your garden. Instead of doing everything alone, each ant has a super simple job—like carrying one leaf or finding one sugar crumb. Together, their simple jobs make the whole anthill work!`;
    missedConcepts = ["Underlying mechanics", "Functional inputs", "System reactions"];
  }
  
  return {
    clarityScore,
    simplicityRating,
    missedConcepts,
    tutorFeedback,
    revisedExplanationExample
  };
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

    let data;
    if (process.env.GEMINI_API_KEY) {
      try {
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
        data = JSON.parse(modelResponse.text || "{}");
      } catch (geminiError: any) {
        console.warn("Circadian Sleep Sunset Gemini call failed, using fallback:", geminiError);
        data = evaluateSleepSunsetProgrammatically(morningSunlightTime);
      }
    } else {
      data = evaluateSleepSunsetProgrammatically(morningSunlightTime);
    }

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

    let data;
    if (process.env.GEMINI_API_KEY) {
      try {
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
        data = JSON.parse(modelResponse.text || "{}");
      } catch (geminiError: any) {
        console.warn("Nutrition analysis Gemini call failed, using fallback:", geminiError);
        data = evaluateNutritionProgrammatically(mealDescription || "visual meal ingestion");
      }
    } else {
      data = evaluateNutritionProgrammatically(mealDescription || "visual meal ingestion");
    }

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

    let data;
    if (process.env.GEMINI_API_KEY) {
      try {
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
        data = JSON.parse(modelResponse.text || "{}");
      } catch (geminiError: any) {
        console.warn("Brain Dump Gemini call failed, using fallback:", geminiError);
        data = evaluateBrainDumpProgrammatically(text);
      }
    } else {
      data = evaluateBrainDumpProgrammatically(text);
    }

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

    let data;
    if (process.env.GEMINI_API_KEY) {
      try {
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
        data = JSON.parse(modelResponse.text || "{}");
      } catch (geminiError: any) {
        console.warn("Feynman evaluator Gemini call failed, using fallback:", geminiError);
        data = evaluateFeynmanProgrammatically(topic, explanation);
      }
    } else {
      data = evaluateFeynmanProgrammatically(topic, explanation);
    }

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
