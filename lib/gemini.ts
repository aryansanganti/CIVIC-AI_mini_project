import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

// Get the generative model for text
export const textModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Get the generative model for vision (image analysis)
export const visionModel = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

// Function to analyze civic issues from images
export async function analyzeCivicIssue(imageBase64: string): Promise<{
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
  confidence: number;
}> {
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/jpeg'
      }
    };

    const prompt = `
      Analyze this image and identify if it shows a civic issue. If it does, provide:
      1. Category: Choose from [Road Damage, Street Light, Garbage, Water Leak, Traffic Signal, Pothole, Street Sign, Other]
      2. Description: A brief description of the issue
      3. Urgency: low, medium, or high based on safety and impact
      4. Confidence: 0-100 score of how confident you are this is a civic issue
      
      If this is not a civic issue, return category as "Not Applicable" and confidence as 0.
      
      Respond in JSON format only:
      {
        "category": "string",
        "description": "string", 
        "urgency": "low|medium|high",
        "confidence": number
      }
    `;

    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      category: 'Other',
      description: 'Unable to analyze image',
      urgency: 'medium',
      confidence: 0
    };
  }
}

// Function to generate issue description from text
export async function generateIssueDescription(userText: string): Promise<{
  category: string;
  description: string;
  urgency: 'low' | 'medium' | 'high';
}> {
  try {
    const prompt = `
      Analyze this civic issue description and provide:
      1. Category: Choose from [Road Damage, Street Light, Garbage, Water Leak, Traffic Signal, Pothole, Street Sign, Other]
      2. Description: A clear, detailed description of the issue
      3. Urgency: low, medium, or high based on safety and impact
      
      User description: "${userText}"
      
      Respond in JSON format only:
      {
        "category": "string",
        "description": "string",
        "urgency": "low|medium|high"
      }
    `;

    const result = await textModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating description:', error);
    return {
      category: 'Other',
      description: userText,
      urgency: 'medium'
    };
  }
} 