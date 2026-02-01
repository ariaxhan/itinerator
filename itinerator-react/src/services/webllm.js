import * as webllm from '@mlc-ai/web-llm'

const MODEL_ID = 'SmolLM2-1.7B-Instruct-q4f16_1-MLC'

let engine = null

export function isWebGPUSupported() {
  return !!navigator.gpu
}

export async function initEngine(onProgress) {
  if (engine) return engine
  engine = await webllm.CreateMLCEngine(MODEL_ID, {
    initProgressCallback: onProgress,
  })
  return engine
}

export async function generateItinerary(quizAnswers) {
  if (!engine) throw new Error('Engine not initialized')

  const prompt = buildPrompt(quizAnswers)

  const response = await engine.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a travel itinerary planner. Create detailed, practical travel itineraries formatted in markdown.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
    max_tokens: 2048,
  })

  return response.choices[0].message.content
}

function buildPrompt(answers) {
  return `Create a detailed day-by-day travel itinerary based on these preferences:

City: ${answers.city || 'a random city'}
Timeframe: ${answers.timeframe || 'a few days'}
Activities: ${answers.activities || 'a variety of activities'}
Budget: ${answers.budget || 'moderate'}
Companions: ${answers.companions || 'solo'}
Transportation: ${answers.transportation || 'any'}
Interests: ${answers.interests || 'general sightseeing'}
Weather: ${answers.weather || 'any weather'}
Special Requirements: ${answers.requirements || 'none'}
Previously Visited: ${answers.visitedBefore || 'No'}
Starting Address: ${answers.startingAddress || 'N/A'}
Destination Address: ${answers.destinationAddress || 'N/A'}

Format your response as markdown with:
- Day-by-day schedule with times
- Specific place names and activity suggestions
- Budget estimates where relevant
- A "Locations" section at the end with coordinates in this exact format:
  * Place Name: latitude, longitude
${answers.packingList === 'Yes' ? '\nInclude a packing list section at the end.' : ''}`
}
