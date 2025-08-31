// utils/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface FoodAnalysisResult {
  isFood: boolean;
  foodName?: string;
  ingredients?: string[];
  nutrition?: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
  };
  rating?: number;
  verdict?: string;
  ingredientsToWatch?: Array<{
    name: string;
    reason: string;
    category: string;
  }>;
  error?: string;
}

export async function analyzeFoodImage(imageUri: string): Promise<FoodAnalysisResult> {
  try {
    // Convert image URI to base64
    const base64Image = await uriToBase64(imageUri);
    
    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create the enhanced prompt for detailed food analysis and rating
    const prompt = `
      You are a nutrition expert AI assistant. Analyze this food product packaging/back label image and provide a comprehensive nutritional assessment.
      
      Instructions:
      1. First, determine if this is a food product packaging/back label. If not, respond with {"isFood": false} and an appropriate error message.
      2. If it is a food product, extract the following information:
         - Product name
         - Complete list of ingredients (as an array)
         - Nutrition facts per serving: calories, protein (g), fat (g), carbs (g), fiber (g), sugar (g)
      
      3. Then provide a detailed nutritional assessment:
         - Give a rating from 1-5 stars (1 = very unhealthy, 5 = very healthy)
         - Provide a brief verdict (e.g., "Healthy Choice", "Moderate", "Needs Improvement")
         - Identify specific ingredients to watch with reasons and categories:
           * Category options: "avoid", "limit", "moderate", "healthy"
           * For each ingredient, explain why it's in that category
         
      Respond in this exact JSON format:
      {
        "isFood": boolean,
        "foodName": "string or null",
        "ingredients": ["array of strings or null"],
        "nutrition": {
          "calories": number,
          "protein": number,
          "fat": number,
          "carbs": number,
          "fiber": number,
          "sugar": number
        } or null,
        "rating": number (1-5) or null,
        "verdict": "string or null",
        "ingredientsToWatch": [
          {
            "name": "ingredient name",
            "reason": "reason for category assignment",
            "category": "avoid|limit|moderate|healthy"
          }
        ] or null
      }
      
      Rating Criteria:
      - 5 stars: Whole food ingredients, high fiber, protein, low added sugar, minimal processing
      - 4 stars: Mostly whole food ingredients, balanced macros, limited additives
      - 3 stars: Moderate processing, balanced but could be improved
      - 2 stars: High in unhealthy ingredients/additives, unbalanced macros
      - 1 star: Contains harmful ingredients, very high in sugar/fat, highly processed
      
      Focus on these aspects when rating:
      1. Ingredient quality (whole vs. processed)
      2. Nutritional balance (protein, fiber, healthy fats vs. sugar, saturated fat)
      3. Presence of harmful additives or excessive amounts of sugar/sodium
      4. Overall processing level
      
      Be specific and evidence-based in your assessment.
    `;
    
    // Generate content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);
    
    // Parse the response
    const responseText = result.response.text();
    console.log("Raw API response:", responseText);
    
    // Extract JSON from markdown code blocks if present
    let jsonString = responseText;
    const jsonCodeBlockMatch = responseText.match(/```(?:json)?\s*({[\s\S]*})\s*```/);
    if (jsonCodeBlockMatch) {
      jsonString = jsonCodeBlockMatch[1];
    } else {
      // If no code blocks, try to find JSON object directly
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonString = responseText.substring(jsonStart, jsonEnd);
      }
    }
    
    let analysis;
    try {
      analysis = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.log("Attempted to parse:", jsonString);
      return {
        isFood: false,
        error: "Failed to analyze the image. Please try again."
      };
    }
    
    if (!analysis.isFood) {
      return {
        isFood: false,
        error: "This doesn't appear to be a food product packaging. Please scan a food item's back label."
      };
    }
    
    return {
      isFood: true,
      foodName: analysis.foodName,
      ingredients: analysis.ingredients,
      nutrition: analysis.nutrition,
      rating: analysis.rating,
      verdict: analysis.verdict,
      ingredientsToWatch: analysis.ingredientsToWatch
    };
  } catch (error) {
    console.error("Gemini API error:", error);
    return {
      isFood: false,
      error: "Failed to analyze the image. Please try again."
    };
  }
}

// Helper function to convert image URI to base64
async function uriToBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}