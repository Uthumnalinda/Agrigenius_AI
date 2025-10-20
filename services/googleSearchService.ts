/**
 * Google Custom Search API - Web Search Service
 * Search Google for farming information, crop guides, weather tips, etc.
 */

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;
const GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1';

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
  formattedUrl?: string;
}

interface WebSearchResponse {
  items?: SearchResult[];
  searchInformation?: {
    totalResults: string;
    searchTime: number;
  };
  error?: {
    message: string;
    code: number;
  };
}

/**
 * Search Google for web results
 * @param query - Search query
 * @param numResults - Number of results to return (1-10)
 * @returns Array of search results
 */
export async function searchGoogle(query: string, numResults: number = 5): Promise<SearchResult[]> {
  try {
    console.log('🔍 Google Web Search for:', query);

    // Check if API keys are configured
    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === 'your_google_api_key_here') {
      console.warn('⚠️ Google API key not configured');
      return [];
    }

    if (!SEARCH_ENGINE_ID || SEARCH_ENGINE_ID === 'your_search_engine_id_here') {
      console.warn('⚠️ Google Search Engine ID not configured');
      return [];
    }

    // Build search parameters
    const params = new URLSearchParams({
      key: GOOGLE_API_KEY,
      cx: SEARCH_ENGINE_ID,
      q: query,
      num: Math.min(numResults, 10).toString(), // Max 10 results per request
    });

    const url = `${GOOGLE_SEARCH_API_URL}?${params.toString()}`;
    console.log('📡 Fetching from Google Search API...');

    const response = await fetch(url);
    const data: WebSearchResponse = await response.json();

    // Handle errors
    if (data.error) {
      console.error(`❌ Google API error (${data.error.code}): ${data.error.message}`);
      return [];
    }

    // Extract results
    if (data.items && data.items.length > 0) {
      console.log(`✅ Found ${data.items.length} results`);
      console.log(`⏱️ Search time: ${data.searchInformation?.searchTime}s`);
      return data.items;
    }

    console.warn('⚠️ No results found');
    return [];

  } catch (error) {
    console.error('❌ Error searching Google:', error);
    return [];
  }
}

/**
 * Search for farming/agriculture specific information
 * @param topic - Topic to search (e.g., "rice farming", "soil pH")
 * @returns Search results
 */
export async function searchFarmingInfo(topic: string): Promise<SearchResult[]> {
  // Add farming-related keywords to improve results
  const query = `${topic} farming agriculture`;
  return searchGoogle(query, 5);
}

/**
 * Search for crop-specific information
 * @param cropName - Name of the crop
 * @param aspect - Specific aspect (e.g., "diseases", "harvesting", "soil requirements")
 * @returns Search results
 */
export async function searchCropInfo(cropName: string, aspect?: string): Promise<SearchResult[]> {
  const query = aspect 
    ? `${cropName} crop ${aspect} farming guide`
    : `${cropName} crop farming guide cultivation`;
  
  return searchGoogle(query, 5);
}

/**
 * Search for weather and climate information
 * @param location - Location name
 * @param topic - Weather topic (e.g., "rainfall", "temperature", "forecast")
 * @returns Search results
 */
export async function searchWeatherInfo(location: string, topic?: string): Promise<SearchResult[]> {
  const query = topic
    ? `${location} ${topic} weather climate agriculture`
    : `${location} weather forecast farming`;
  
  return searchGoogle(query, 3);
}

/**
 * Search for pest and disease information
 * @param pestOrDisease - Name of pest or disease
 * @param cropName - Optional crop name
 * @returns Search results
 */
export async function searchPestInfo(pestOrDisease: string, cropName?: string): Promise<SearchResult[]> {
  const query = cropName
    ? `${pestOrDisease} ${cropName} crop treatment control prevention`
    : `${pestOrDisease} plant disease pest control treatment`;
  
  return searchGoogle(query, 5);
}

export type { SearchResult };
