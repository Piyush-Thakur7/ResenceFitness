import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.NEXT_PUBLIC_GEMINI_MODEL || 'gemini-1.5-flash';

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to check if Gemini is configured
function getModel() {
  if (!genAI) {
    throw new Error('Gemini API Key is not configured. Please add GEMINI_API_KEY to your .env.local file.');
  }
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generates an adaptive weekly workout plan
 */
export async function generateWorkoutPlan(profile, assessmentReport = '') {
  const model = getModel();

  const prompt = `
    You are a professional fitness coach. Generate a personalized weekly workout plan (Monday to Sunday) for a user with the following details:
    - Age: ${calculateAge(profile.dob)} years
    - Gender: ${profile.gender || 'male'}
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg
    - Fitness Goal: ${profile.fitness_goal}
    - Injury/Physical Limitation: ${profile.injuries || 'None'}
    - Conditioning Preference: ${profile.conditioning_preference || 'Running'}
    - Latest Body Assessment Report: ${assessmentReport || 'None'}

    Requirements:
    1. Monday to Saturday should be active, Sunday should be rest.
    2. Active days must have:
       - A gym workout session (~45-60 mins) organized by muscle group.
       - A dedicated pre-workout warm-up instruction detailing 2-3 dynamic stretching movements.
       - Include at least 5 to 6 structured core strength exercises in the daily plan.
       - A conditioning session modeled after their preference:
         - If preference is 'None', the running/cardio key should be set to null.
         - If preference is 'Running', generate running interval runs (e.g. 3km total, chunks like "3 x 1km").
         - If preference is 'Rope Skipping', generate skipping drills (e.g., "4 rounds of 3 min jump rope, fast pace").
         - If preference is 'Boxing', generate heavy bag and shadow boxing drills.
       - Include name of the exercise and the target muscle group. Do NOT generate MuscleWiki URLs, just output name and muscle group.
    3. Implement built-in recovery logic: if there are consecutive hard training days on the same muscle group, auto-suggest a lighter active-recovery day.
    4. Output the response in JSON format matching this schema:
    {
      "week_start_date": "YYYY-MM-DD",
      "recovery_notes": "Explanation of the recovery logic and training structure",
      "days": {
        "monday": {
          "muscle_group": "string",
          "is_rest": false,
          "gym_duration_minutes": 55,
          "pre_workout_warmup": "string detailing warm-up steps (e.g. 5 mins arm circles, dynamic chest stretches)",
          "running": {
            "distance_km": 3,
            "chunks": "e.g., 3 x 1km or 4 rounds",
            "instructions": "string (or cardio/skipping instructions)"
          }, // This object must be null if Conditioning Preference is 'None'
          "exercises": [
            {
              "name": "string",
              "muscle": "string (e.g. Chest, Quads, Triceps)",
              "sets": 4,
              "reps": "string (e.g., 8-12)",
              "notes": "string"
            }
          ]
        },
        ...
        "sunday": {
          "is_rest": true,
          "notes": "Rest day instructions"
        }
      }
    }
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(result.response.text());
}

/**
 * Generates an adaptive diet plan
 */
export async function generateDietPlan(profile) {
  const model = getModel();

  const prompt = `
    You are an expert nutritionist. Generate a personalized weekly diet plan for a user with the following details:
    - Weight: ${profile.weight} kg
    - Height: ${profile.height} cm
    - Age: ${calculateAge(profile.dob)} years
    - Fitness Goal: ${profile.fitness_goal}
    - Diet Preference: ${profile.diet_preference}

    Requirements:
    1. Calculate daily targets for: Calories (kcal), Protein (g), Carbs (g), and Fat (g).
    2. Daily targets should be optimized for their goal:
       - Bulky: Higher calorie surplus, high protein (1.6g - 2.2g per kg bodyweight).
       - Lean / Fat Loss: Calorie deficit, high protein to preserve muscle and target fat oxidation.
       - Athletic / Healthy: Balanced macros.
    3. Generate meal suggestions for: Breakfast, Lunch, Dinner, Snack that align STRICTLY with their Diet Preference (${profile.diet_preference}):
       - If preference is "Veg": No meat, poultry, fish, seafood, or eggs. Dairy (milk, paneer, cheese) is allowed.
       - If preference is "Vegan": Strictly plant-based. No dairy, no eggs, no meat, no fish, no animal products.
       - If preference is "Eggetarian": Vegetarian but eggs are allowed. No meat, poultry, fish, or seafood.
       - If preference is "Non-Veg": All options (chicken, fish, eggs, meat, dairy) are allowed.
    4. Provide the result in JSON format matching this schema:
    {
      "daily_targets": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number
      },
      "meal_suggestions": {
        "breakfast": "string description with estimated calories/protein",
        "lunch": "string description with estimated calories/protein",
        "dinner": "string description with estimated calories/protein",
        "snack": "string description with estimated calories/protein"
      }
    }
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(result.response.text());
}

/**
 * Recognizes food photo and estimates nutrition
 */
export async function analyzeFoodPhoto(base64Image, mimeType = 'image/jpeg') {
  const model = getModel();

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType
    },
  };

  const prompt = `
    Analyze this photo of a meal. Estimate its nutritional value as accurately as possible.
    
    If the image is not food, return a dummy item with meal_name "Not identified as food" and 0 macros.

    Output the response in JSON format matching this schema:
    {
      "meal_name": "Name of the meal",
      "calories": number,
      "protein": number, -- in grams
      "carbs": number, -- in grams
      "fat": number -- in grams
    }
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }, imagePart] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(result.response.text());
}

/**
 * Conducts body assessment from uploaded photos
 */
export async function analyzeBodyPhotos(base64Images, profile, mimeType = 'image/jpeg') {
  const model = getModel();

  const imageParts = base64Images.map((img) => ({
    inlineData: {
      data: img,
      mimeType
    }
  }));

  const prompt = `
    You are an elite fitness trainer and physique expert. Analyze the attached body photo(s) alongside the user's details:
    - Weight: ${profile.weight} kg
    - Height: ${profile.height} cm
    - Age: ${calculateAge(profile.dob)} years
    - Fitness Goal: ${profile.fitness_goal}
    - Injury/Limitations: ${profile.injuries || 'None'}

    Provide a professional, motivating body assessment in Markdown format. Cover:
    1. **Physique Assessment**: Visual estimate of current physique (muscularity, posture highlights, etc.).
    2. **Gaps to Goal State**: What is needed to reach their target goal (${profile.fitness_goal}).
    3. **Focus Areas**: Recommended focus points (e.g. lower body strength, shoulder width, fat loss phases, etc.).
    
    Be supportive, factual, and strictly constructive. Avoid overly critical language.
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }]
  });
  return result.response.text();
}

/**
 * Re-evaluates next week's fitness plan based on history
 */
export async function reEvaluatePlan(profile, currentPlan, completionRate, weightTrend, qualitativeFeedback) {
  const model = getModel();

  const prompt = `
    You are an adaptive fitness coach. Review the user's performance this week and adjust their fitness plan.
    - User Goal: ${profile.fitness_goal}
    - Target Weight: ${profile.weight} kg
    - Completion Rate of Daily Exercises: ${completionRate}%
    - Weight Trend: ${weightTrend} (e.g., "lost 0.5kg", "gained 0.2kg", "stable")
    - User Feedback: "${qualitativeFeedback}"
    - Current Plan Details: ${JSON.stringify(currentPlan)}

    Generate an adjusted weekly workout and diet plan.
    - If completion rate is low, make the workout plan more manageable (fewer exercises, lower volume, or active recovery).
    - If the user is consistently completing exercises and finds it too easy, increase the difficulty (intensity, sets, reps).
    - If weight isn't trending toward the goal (e.g., trying to bulk but weight is stable/down, or trying to lean down but weight is stable/up), adjust the caloric intake suggestion slightly.

    Output the response in JSON format matching this schema:
    {
      "workout_plan": {
        "recovery_notes": "string explaining adjustment",
        "days": {
          "monday": {
            "muscle_group": "string",
            "is_rest": false,
            "gym_duration_minutes": number,
            "running": { "distance_km": number, "chunks": "string", "instructions": "string" },
            "exercises": [
              { "name": "string", "muscle": "string", "sets": number, "reps": "string", "notes": "string" }
            ]
          },
          ...
          "sunday": { "is_rest": true, "notes": "string" }
        }
      },
      "diet_plan": {
        "daily_targets": { "calories": number, "protein": number, "carbs": number, "fat": number },
        "meal_suggestions": { "breakfast": "string", "lunch": "string", "dinner": "string", "snack": "string" }
      }
    }
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  return JSON.parse(result.response.text());
}

// Utility to calculate age
function calculateAge(dobString) {
  if (!dobString) return 25;
  const birthDate = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Interactive fitness chat with profile context
 */
export async function chatWithCoach(profile, messages) {
  if (!genAI) {
    throw new Error('Gemini API Key is not configured.');
  }
  
  const age = calculateAge(profile.dob);
  const systemInstruction = `
    You are Resence AI Coach, an elite personal trainer and nutritionist.
    You are speaking with a user who has the following profile:
    - Age: ${age} years
    - Gender: ${profile.gender || 'male'}
    - Height: ${profile.height} cm
    - Weight: ${profile.weight} kg
    - Fitness Goal: ${profile.fitness_goal}
    - Diet Preference: ${profile.diet_preference}
    - Injuries/Limitations: ${profile.injuries || 'None'}
    - Conditioning/Cardio Preference: ${profile.conditioning_preference || 'Running'}
    
    Answer their fitness, training, sleep, and nutrition questions.
    Be motivational, professional, scientific, yet encouraging. Highlight concepts like "Discipline Equals Freedom" or "Every Day Is Day One" where appropriate.
    Always format your responses in clean Markdown (use bullet points, bold tags, and clear sections).
    Keep your answers concise, practical, and highly tailored to their specific goal (${profile.fitness_goal}) and limitations.
    If they ask about exercises, describe proper form clearly. Do not use generic placeholders.
  `;

  // Filter messages to match role and parts format
  const chatContents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  const chatModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction
  });

  const result = await chatModel.generateContent({
    contents: chatContents
  });

  return result.response.text();
}
