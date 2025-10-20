/**
 * AI Image Generation Service using Replicate
 * Generates realistic crop images using Stable Diffusion
 * 
 * Cost: ~$0.001 per image
 * Setup: Get API key from https://replicate.com/
 */

const REPLICATE_API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;

interface ReplicateResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[];
  error?: string;
}

/**
 * Generate a crop image using AI
 * @param cropName - Name of the crop
 * @returns Generated image URL
 */
export async function generateCropImage(cropName: string): Promise<string> {
  try {
    if (!REPLICATE_API_KEY || REPLICATE_API_KEY === 'your_replicate_key_here') {
      console.warn('⚠️ Replicate API key not configured');
      return getFallbackUrl(cropName);
    }

    console.log(`🎨 Generating AI image for: ${cropName}`);

    // Create prediction
    const createResponse = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${REPLICATE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        input: {
          prompt: `professional photograph of ${cropName} crop growing in agricultural field, realistic, high quality, farming landscape, detailed plant`,
          negative_prompt: 'cartoon, drawing, sketch, illustration, low quality, blurry',
          width: 512,
          height: 512,
          num_outputs: 1
        }
      })
    });

    const prediction: ReplicateResponse = await createResponse.json();

    if (!prediction.id) {
      throw new Error('Failed to create prediction');
    }

    // Poll for result (max 30 seconds)
    let result = prediction;
    for (let i = 0; i < 30; i++) {
      if (result.status === 'succeeded' && result.output) {
        console.log(`✅ Generated image for ${cropName}:`, result.output[0]);
        return result.output[0];
      }

      if (result.status === 'failed') {
        throw new Error(result.error || 'Generation failed');
      }

      // Wait 1 second before checking again
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check status
      const statusResponse = await fetch(
        `https://api.replicate.com/v1/predictions/${prediction.id}`,
        {
          headers: {
            'Authorization': `Token ${REPLICATE_API_KEY}`
          }
        }
      );
      result = await statusResponse.json();
    }

    throw new Error('Generation timeout');

  } catch (error) {
    console.error(`❌ AI generation failed for ${cropName}:`, error);
    return getFallbackUrl(cropName);
  }
}

/**
 * Fallback to LoremFlickr
 */
function getFallbackUrl(cropName: string): string {
  const query = encodeURIComponent(`${cropName} plant agriculture`);
  return `https://loremflickr.com/300/200/${query}`;
}

// Add to .env.local:
// VITE_REPLICATE_API_KEY=r8_your_api_key_here
