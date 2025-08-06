import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('Gemini API key is not defined in environment variables.');
}
const genAI = new GoogleGenerativeAI(apiKey);

export const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Test function to verify API key is working
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const result = await textModel.generateContent('Say "API working" if you can read this.');
    const response = await result.response;
    const text = response.text();
    console.log('Gemini test response:', text);
    return text.toLowerCase().includes('api working');
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
}

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

    console.log('Gemini response:', text); // For debugging

    // Clean the response text and extract JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      return {
        category: parsedResult.category || 'Other',
        description: parsedResult.description || 'Unable to analyze image',
        urgency: parsedResult.urgency || 'medium',
        confidence: typeof parsedResult.confidence === 'number' ? parsedResult.confidence : 0
      };
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error analyzing image:', error);
    return {
      category: 'Other',
      description: 'Unable to analyze image - please try again',
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

    console.log('Gemini text response:', text); // For debugging

    // Clean the response text and extract JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsedResult = JSON.parse(jsonMatch[0]);
      return {
        category: parsedResult.category || 'Other',
        description: parsedResult.description || userText,
        urgency: parsedResult.urgency || 'medium'
      };
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