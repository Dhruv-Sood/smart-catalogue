import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SYSTEM_CONTEXT,
  IMAGE_ANALYSIS_PROMPT,
  TEXT_ANALYSIS_PROMPT,
  COMBINED_ANALYSIS_PROMPT,
  BATCH_CATEGORIZATION_PROMPT
} from '../config/prompts.js';

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_CONTEXT
    });
    this.visionModel = this.genAI.getGenerativeModel({ 
      model: 'gemini-flash-latest',
      systemInstruction: SYSTEM_CONTEXT
    });
  }

  async analyzeImage(imageBuffer, mimeType) {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    };

    const result = await this.visionModel.generateContent([
      IMAGE_ANALYSIS_PROMPT,
      imagePart
    ]);

    return this.parseResponse(result.response.text());
  }

  async analyzeText(description) {
    const prompt = TEXT_ANALYSIS_PROMPT.replace('{description}', description);
    const result = await this.model.generateContent(prompt);
    return this.parseResponse(result.response.text());
  }

  async analyzeImageAndText(imageBuffer, mimeType, description) {
    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType
      }
    };

    const prompt = COMBINED_ANALYSIS_PROMPT.replace('{description}', description);
    const result = await this.visionModel.generateContent([prompt, imagePart]);
    return this.parseResponse(result.response.text());
  }

  async batchCategorize(products) {
    const prompt = BATCH_CATEGORIZATION_PROMPT.replace(
      '{products}',
      JSON.stringify(products, null, 2)
    );
    const result = await this.model.generateContent(prompt);
    return this.parseResponse(result.response.text());
  }

  parseResponse(text) {
    console.log('Gemini raw response:', text.substring(0, 300));

    // Try extracting from markdown code block first
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = codeBlock ? codeBlock[1].trim() : text.trim();

    // Try direct parse
    try {
      return JSON.parse(candidate);
    } catch {}

    // Try finding JSON object in the text
    const objMatch = candidate.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try { return JSON.parse(objMatch[0]); } catch {}
    }

    // Try finding JSON array
    const arrMatch = candidate.match(/\[[\s\S]*\]/);
    if (arrMatch) {
      try { return JSON.parse(arrMatch[0]); } catch {}
    }

    console.error('Could not parse Gemini response:', text);
    throw new Error('Failed to parse AI response as JSON');
  }
}

export default new GeminiService();
