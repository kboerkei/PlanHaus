import OpenAI from "openai";
import { logError, logInfo } from "../../utils/logger";

// Validate API key availability
export function validateOpenAIKey(): boolean {
  return !!(process.env.OPENAI_API_KEY || process.env.OPENAI_KEY);
}

// Initialize OpenAI client with secure configuration
// Use placeholder if no key available - validation happens at runtime
export const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || "placeholder-key"
});

// Debug mode for development
export const isDebugMode = process.env.NODE_ENV !== 'production';

/**
 * Utility function to generate OpenAI responses with consistent error handling
 */
export async function generatePromptResponse<T>(
  systemMessage: string,
  userPrompt: string,
  fallback: T,
  context?: { source: string; inputs?: Record<string, any> }
): Promise<T> {
  // Validate API key at runtime
  if (!validateOpenAIKey()) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Log full response in debug mode
    if (isDebugMode && context) {
      logInfo(context.source, 'OpenAI API Response', { 
        prompt: userPrompt.substring(0, 200) + '...',
        response: content.substring(0, 500) + '...',
        usage: response.usage
      });
    }

    return JSON.parse(content);
  } catch (error) {
    if (context) {
      logError(context.source, error as Error, { 
        inputs: context.inputs,
        systemMessage: systemMessage.substring(0, 100) + '...',
        userPrompt: userPrompt.substring(0, 200) + '...'
      });
    }
    
    return fallback;
  }
}

/**
 * Generate plain text chat responses (no JSON formatting)
 */
export async function generateChatResponse(
  systemMessage: string,
  userPrompt: string,
  context?: { source: string; inputs?: Record<string, any> }
): Promise<string> {
  // Validate API key at runtime
  if (!validateOpenAIKey()) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const messages = [
      {
        role: "system" as const,
        content: systemMessage
      },
      {
        role: "user" as const,
        content: userPrompt
      }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      // No JSON format required for chat responses
      max_tokens: 500,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI");
    }

    // Log full response in debug mode
    if (isDebugMode && context) {
      logInfo(context.source, 'OpenAI Chat Response', { 
        prompt: userPrompt.substring(0, 200) + '...',
        response: content.substring(0, 500) + '...',
        usage: response.usage
      });
    }

    return content;
  } catch (error) {
    if (context) {
      logError(context.source, error as Error, { 
        inputs: context.inputs,
        systemMessage: systemMessage.substring(0, 100) + '...',
        userPrompt: userPrompt.substring(0, 200) + '...'
      });
    }
    
    throw error; // Re-throw so calling function can handle with fallbacks
  }
}

/**
 * Utility function for image analysis with OpenAI Vision
 */
export async function generateImageAnalysisResponse<T>(
  systemMessage: string,
  imageBase64: string,
  imageFormat: 'jpeg' | 'png' | 'webp',
  additionalText?: string,
  fallback?: T,
  context?: { source: string; inputs?: Record<string, any> }
): Promise<T | null> {
  // Validate API key at runtime
  if (!validateOpenAIKey()) {
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: systemMessage + (additionalText ? ` ${additionalText}` : '')
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${imageFormat};base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const content = response.choices[0].message.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI Vision");
    }

    // Log full response in debug mode
    if (isDebugMode && context) {
      logInfo(context.source, 'OpenAI Vision Response', { 
        imageFormat,
        response: content.substring(0, 500) + '...',
        usage: response.usage
      });
    }

    return JSON.parse(content);
  } catch (error) {
    if (context) {
      logError(context.source, error as Error, { 
        inputs: context.inputs,
        imageFormat,
        systemMessage: systemMessage.substring(0, 100) + '...'
      });
    }
    
    return fallback || null;
  }
}