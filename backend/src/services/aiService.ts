// backend/src/services/aiService.ts
import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Check if OpenRouter API key is configured
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

if (!OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY is not set. Using mock AI service for testing.");
}
const OPENROUTER_REFERRER = process.env.OPENROUTER_REFERRER || "https://chainmuse.app";
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || "ChainMuse";

interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Generates story content based on a user prompt using OpenRouter.
 * Supports multiple AI models including Llama 3, Mistral, Claude, etc.
 * @param prompt The user's prompt to continue or start a story.
 * @param parentContent Optional content from the parent node to provide context.
 * @param model The AI model to use (default: mistralai/mistral-7b-instruct).
 * @returns The AI-generated story text.
 */
export async function generateStoryContent(
  prompt: string, 
  parentContent?: string,
  model: string = "mistralai/mistral-7b-instruct"
): Promise<string> {
  console.log(`🤖 Calling OpenRouter (${model}) to generate story content...`);

  // If no API key, return mock content
  if (!OPENROUTER_API_KEY) {
    console.log('⚠️ Using mock AI story for testing');
    return `This is a mock AI-generated story based on your prompt: "${prompt}". ${
      parentContent ? `Continuing from the previous story...` : 'Starting a new adventure...'
    } The hero faces new challenges and mysteries unfold. What happens next is up to you!`;
  }

  const systemPrompt = `You are an award-winning creative storyteller for "ChainMuse", a collaborative branching-narrative platform.

WRITING STYLE:
- Write vivid, immersive narratives with rich sensory details
- Use descriptive language and metaphors
- Create emotional depth and character development
- Build tension and intrigue naturally
- Write 150-200 words (more engaging than shorter stories)

NARRATIVE STRUCTURE:
- Continue naturally from the previous context
- Introduce new plot elements or character development
- Add dialogue if appropriate
- End with a cliffhanger or open question that invites continuation
- Make each branch feel like a complete mini-story

${parentContent ? `CONTEXT FROM PREVIOUS NODE:\n---\n${parentContent}\n---\n\nBuild upon this context naturally and maintain story continuity.` : "This is the opening of a new story. Create an engaging hook that captures the reader's imagination."}

IMPORTANT LANGUAGE RULES:
- If the user writes in Turkish (Türkçe), write your ENTIRE response in Turkish
- If the user writes in English, write in English
- Match the user's language exactly - this is critical
- Use natural, flowing prose in the target language
- Respect cultural nuances and idioms of the language

TONE:
- Engaging and thought-provoking
- Professional but creative
- Appropriate for a multi-language audience`;

  try {
    const response = await axios.post<OpenRouterResponse>(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 500,
        top_p: 0.95,
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": OPENROUTER_REFERRER,
          "X-Title": OPENROUTER_APP_NAME,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    if (!content) {
      throw new Error('OpenRouter returned an empty content.');
    }

    console.log('✅ Story content generated successfully.');
    return content;
  } catch (error) {
    console.error('❌ Error generating content from OpenRouter:', error);
    throw new Error('Failed to generate story content.');
  }
}

/**
 * Get available AI models from OpenRouter.
 * @returns Array of available model names.
 */
export async function getAvailableModels(): Promise<string[]> {
  // If no API key, return default models
  if (!OPENROUTER_API_KEY) {
    return [
      "mistralai/mistral-7b-instruct",
      "meta-llama/llama-3-8b-instruct",
      "anthropic/claude-3-haiku"
    ];
  }

  try {
    const response = await axios.get(
      "https://openrouter.ai/api/v1/models",
      {
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        },
      }
    );

    return response.data.data
      .filter((model: any) => model.id.includes('instruct') || model.id.includes('chat'))
      .map((model: any) => model.id)
      .slice(0, 10); // Return top 10 models
  } catch (error) {
    console.error('❌ Error fetching models from OpenRouter:', error);
    return ["mistralai/mistral-7b-instruct", "meta-llama/llama-3-8b-instruct"];
  }
}