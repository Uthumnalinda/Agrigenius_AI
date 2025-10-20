import React, { useState } from 'react';
import { searchGoogle, searchFarmingInfo, type SearchResult } from '../services/googleSearchService';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

export const WebSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setError('');
    setIsSearching(true);
    setResults([]);

    try {
      const searchResults = await searchGoogle(searchQuery, 10);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        setError('No results found. Try different keywords.');
      }
    } catch (err) {
      setError('Search failed. Please check your API configuration.');
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = async (query: string) => {
    setSearchQuery(query);
    setError('');
    setIsSearching(true);
    setResults([]);

    try {
      const searchResults = await searchFarmingInfo(query);
      setResults(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 to-green-50 p-6 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl mb-4">
            <Icon name="search" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Google Web Search
          </h1>
          <p className="text-gray-600">
            Search the web for farming information, crop guides, and more
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for farming tips, crop guides, weather info..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-lime-400 transition-colors"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-6 py-3 bg-gradient-to-r from-lime-400 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* Quick Search Suggestions */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Quick searches:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'rice cultivation',
                  'wheat farming tips',
                  'corn disease prevention',
                  'organic fertilizer',
                  'drip irrigation',
                  'crop rotation benefits',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleQuickSearch(suggestion)}
                    className="px-3 py-1 text-sm bg-lime-100 text-lime-700 rounded-full hover:bg-lime-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700">❌ {error}</p>
          </div>
        )}

        {/* Loading Spinner */}
        {isSearching && (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        )}

        {/* Search Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Found {results.length} results
            </p>
            
            {results.map((result, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
              >
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <h3 className="text-lg font-semibold text-lime-600 group-hover:text-lime-700 mb-1">
                    {result.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {result.displayLink}
                  </p>
                  <p className="text-gray-700">
                    {result.snippet}
                  </p>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* No Results State */}
        {!isSearching && !error && results.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-600">
              Search for farming information, crop guides, and agricultural tips
            </p>
          </div>
        )}

        {/* API Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2">📋 API Information</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Uses the same Google API key from .env.local</li>
            <li>• Free tier: 100 searches per day</li>
            <li>• Search results are from Google's web index</li>
            <li>• Configure API key in GOOGLE_IMAGE_SETUP.md</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
