import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { fileToDataUrl } from '../utils/imageUtils';
import { searchCropImage, getCropImageFallbacks } from '../services/googleImageService';
import { Spinner } from './Spinner';
import { Icon } from './Icon';

const SoilScanner: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [cropImages, setCropImages] = useState<Map<string, string>>(new Map());
  const [imageAttempts, setImageAttempts] = useState<Map<string, number>>(new Map());
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [cropGuide, setCropGuide] = useState<string>('');
  const [isLoadingGuide, setIsLoadingGuide] = useState<boolean>(false);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setAnalysis('');

    try {
      // Convert to data URL for preview
      const dataUrl = await fileToDataUrl(file);
      setSelectedImage(dataUrl);

      setIsLoading(true);

      const prompt = `Analyze this soil image and return ONLY a simple list of the top 5 crops that grow best in this soil.

IMPORTANT: Your response must be ONLY crop names, one per line, in this EXACT format:
CropName1
CropName2
CropName3
CropName4
CropName5

No explanations, no descriptions, no emojis, no extra text. Just the crop names, each on a new line.

Example correct response:
Rice
Wheat
Corn
Sugarcane
Cotton

If this is not soil, respond with only: "NotSoil"`;

      const response = await geminiService.generateContentWithImage(prompt, file);
      
      if (!response) {
        throw new Error('No analysis available');
      }
      
      setAnalysis(response);
    } catch (e) {
      setError('Failed to analyze soil. Please try again with a clear soil image.');
      setSelectedImage(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetScanner = () => {
    setSelectedImage(null);
    setAnalysis('');
    setError('');
  };

  // Load crop images when analysis is ready
  React.useEffect(() => {
    if (analysis && analysis !== 'NotSoil') {
      const crops = analysis.split('\n').filter(line => line.trim() && !line.includes('soil') && !line.includes('analysis'));
      
      console.log('🔍 Loading images for crops:', crops);
      
      // Fetch all crop images
      const loadImages = async () => {
        const newImages = new Map<string, string>();
        
        for (const crop of crops) {
          const cropName = crop.trim();
          console.log(`📸 Fetching image for: ${cropName}`);
          const imageUrl = await searchCropImage(cropName);
          console.log(`✅ Got URL for ${cropName}:`, imageUrl);
          newImages.set(cropName, imageUrl);
        }
        
        setCropImages(newImages);
        console.log('🎉 All images loaded!', newImages);
      };
      
      loadImages();
    }
  }, [analysis]); // Only re-run when analysis changes

  // Fetch detailed planting guide for a crop
  const handleCropClick = async (cropName: string) => {
    setSelectedCrop(cropName);
    setIsLoadingGuide(true);
    setCropGuide('');

    try {
      const prompt = `Provide a comprehensive planting guide for ${cropName} in simple, clear steps.

Include:
1. 🌱 Planting Season: Best time to plant
2. 🌡️ Temperature: Ideal growing temperature
3. 💧 Water Needs: How often to water
4. ☀️ Sunlight: Hours of sun needed
5. 🌾 Soil Type: Best soil conditions
6. 📏 Spacing: Plant spacing requirements
7. ⏰ Growing Time: Days to harvest
8. 🌿 Care Tips: Simple maintenance tips
9. 🐛 Common Pests: What to watch for
10. 🥗 Harvest Guide: When and how to harvest

Keep it simple, practical, and easy to understand. Use bullet points.`;

      const response = await geminiService.generateContent(prompt);
      setCropGuide(response || 'Failed to load planting guide.');
    } catch (err) {
      setCropGuide('Failed to load planting guide. Please try again.');
      console.error('Error fetching crop guide:', err);
    } finally {
      setIsLoadingGuide(false);
    }
  };

  // Close the guide modal
  const closeGuide = () => {
    setSelectedCrop(null);
    setCropGuide('');
  };

  const renderCrops = (text: string) => {
    if (text.trim() === 'NotSoil') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <span className="text-4xl mb-2 block">⚠️</span>
          <p className="text-yellow-800 font-semibold">This doesn't appear to be soil</p>
          <p className="text-yellow-700 text-sm mt-2">Please upload a clear image of soil</p>
        </div>
      );
    }

    const crops = text.split('\n').filter(line => line.trim() && !line.includes('soil') && !line.includes('analysis'));
    
    console.log('🌾 Crops recommended:', crops);
    console.log('📊 Total crops:', crops.length);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        {crops.map((crop, index) => {
          const cropName = crop.trim();
          // Get image from state, or generate LoremFlickr URL as immediate fallback
          const imageUrl = cropImages.get(cropName) || 
            `https://loremflickr.com/300/200/${encodeURIComponent(cropName + ' plant agriculture')}`;
          
          console.log(`🌱 Rendering crop ${index + 1}:`, cropName, '→', imageUrl);
          
          return (
            <div 
              key={index}
              onClick={() => handleCropClick(cropName)}
              className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-lime-400 transition-all hover:shadow-lg cursor-pointer"
            >
              <div className="relative h-40 bg-gradient-to-br from-lime-100 to-green-100 flex items-center justify-center">
                {imageUrl ? (
                  <img 
                    src={imageUrl}
                    alt={cropName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                    onLoad={() => {
                      console.log(`✅ Image loaded successfully for ${cropName}:`, imageUrl);
                    }}
                    onError={(e) => {
                      const target = e.currentTarget;
                      const currentAttempt = imageAttempts.get(cropName) || 0;
                      
                      console.error(`❌ Image failed (attempt ${currentAttempt + 1}) for ${cropName}`);
                      console.error(`   Failed URL:`, imageUrl);
                      
                      // Get all fallback URLs for this crop
                      const fallbackUrls = getCropImageFallbacks(cropName);
                      console.log(`   Available fallbacks for ${cropName}:`, fallbackUrls);
                      
                      // Try next URL if available
                      if (currentAttempt < fallbackUrls.length - 1) {
                        const nextUrl = fallbackUrls[currentAttempt + 1];
                        console.log(`🔄 Trying fallback ${currentAttempt + 2}/${fallbackUrls.length} for ${cropName}:`, nextUrl);
                        
                        // Update attempt counter
                        setImageAttempts(prev => new Map(prev).set(cropName, currentAttempt + 1));
                        
                        // Update image URL
                        setCropImages(prev => new Map(prev).set(cropName, nextUrl));
                      } else {
                        // All URLs failed, show emoji fallback
                        console.error(`❌ All ${fallbackUrls.length} image sources failed for:`, cropName);
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.fallback-emoji')) {
                          const emoji = document.createElement('div');
                          emoji.className = 'text-6xl fallback-emoji';
                          emoji.textContent = '🌾';
                          parent.appendChild(emoji);
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="text-6xl">🌾</div>
                )}
              </div>
              <div className="p-3 text-center">
                <h4 className="text-base font-bold text-gray-800">{cropName}</h4>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Icon name="lightbulb" className="w-7 h-7 text-lime-600 mr-2" />
            Soil Scanner
          </h2>
          <p className="text-gray-600 text-sm mt-1">Upload soil image to get crop recommendations</p>
        </div>
      </div>

      {/* Upload Section */}
      {!selectedImage && (
        <div className="bg-gradient-to-br from-lime-50 to-green-50 border-2 border-dashed border-lime-300 rounded-xl p-8 text-center hover:border-lime-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
            id="soil-upload"
          />
          <label htmlFor="soil-upload" className="cursor-pointer">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="scan" className="w-10 h-10 text-lime-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Upload Soil Image</h3>
              <p className="text-sm text-gray-600 mb-4">
                Take a clear photo of your soil and get instant crop recommendations
              </p>
              <div className="bg-lime-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-lime-700 transition-colors">
                Choose Image
              </div>
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <span className="text-xl mr-2">⚠️</span>
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Image Preview & Analysis */}
      {selectedImage && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-800">Uploaded Image</h3>
              <button
                onClick={resetScanner}
                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
              >
                <Icon name="arrowRight" className="w-4 h-4 mr-1 rotate-180" />
                Scan Another
              </button>
            </div>
            <img
              src={selectedImage}
              alt="Uploaded soil"
              className="w-full max-h-96 object-contain rounded-lg bg-gray-50"
            />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="bg-lime-50 border border-lime-200 rounded-xl p-8 text-center">
              <Spinner />
              <p className="text-lime-700 font-medium mt-4">Analyzing soil composition...</p>
              <p className="text-lime-600 text-sm mt-2">Finding best crops for your soil</p>
            </div>
          )}

          {/* Crop Recommendations */}
          {analysis && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-lime-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-xl">🌾</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Recommended Crops</h3>
                  <p className="text-sm text-gray-500">Best crops for your soil type</p>
                </div>
              </div>
              {renderCrops(analysis)}
            </div>
          )}
        </div>
      )}

      {/* Info Section */}
      {!selectedImage && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
            <span className="mr-2">💡</span>
            Tips for Best Results
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
            <li>Take a clear, well-lit photo of the soil</li>
            <li>Remove any debris or plants from the soil surface</li>
            <li>Capture the soil texture and color clearly</li>
            <li>Include a bit of soil depth if possible</li>
          </ul>
        </div>
      )}

      {/* Crop Guide Modal */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-lime-500 to-green-600 p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white flex items-center">
                🌱 {selectedCrop} Growing Guide
              </h3>
              <button
                onClick={closeGuide}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
              >
                <Icon name="close" className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingGuide ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Spinner />
                  <p className="text-gray-600 mt-4">Loading planting guide...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {cropGuide}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 flex justify-end">
              <button
                onClick={closeGuide}
                className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoilScanner;
