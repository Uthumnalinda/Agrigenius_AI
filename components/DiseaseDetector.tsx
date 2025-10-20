import React, { useState, useCallback, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { fileToDataUrl } from '../utils/imageUtils';
import { ScannedPlant } from '../types';
import { Spinner } from './Spinner';
import { Icon } from './Icon';

const DiseaseDetector: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [history, setHistory] = useState<ScannedPlant[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const loadHistory = async () => {
      const savedPlants = await dbService.getScannedPlants();
      setHistory(savedPlants.reverse());
    };
    loadHistory();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult('');
      setError('');
    }
  };

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError('');
    setResult('');
    try {
      const prompt = "Analyze this plant leaf image for diseases. Act as an expert plant pathologist. 👨‍⚕️🌿 Your response should be clear, well-structured, and use emojis to enhance readability. Use markdown for bolding important keywords (e.g., **Diagnosis**, **Symptoms**). Provide a detailed diagnosis, describe symptoms, and suggest both organic and chemical treatment options. If the plant appears healthy, state that clearly and offer tips for keeping it healthy.";
      const analysis = await geminiService.generateContentWithImage(prompt, imageFile);
      
      if (!analysis) {
        throw new Error('No analysis result received');
      }
      
      setResult(analysis);

      // Save to DB
      const imageDataUrl = await fileToDataUrl(imageFile);
      const newPlant: ScannedPlant = {
        id: new Date().toISOString(),
        imageDataUrl,
        analysisResult: analysis,
        timestamp: new Date().toLocaleString(),
      };
      await dbService.saveScannedPlant(newPlant);
      setHistory(prev => [newPlant, ...prev]);

      // Show notification
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);

    } catch (e) {
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);
  
  const renderFormattedText = (text: string) => {
    const blocks: React.ReactNode[] = [];
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        blocks.push(<ul key={`ul-${blocks.length}`} className="list-disc pl-5 space-y-1">{listItems}</ul>);
        listItems = [];
      }
    };

    const parseInline = (line: string) => {
      return line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });
    };

    text.split('\n').forEach((line, index) => {
      if (line.startsWith('* ')) {
        listItems.push(<li key={index}>{parseInline(line.substring(2))}</li>);
      } else {
        flushList();
        if (line.match(/^\*\*.*\*\*$/)) {
          blocks.push(<h4 key={index} className="text-md font-bold text-gray-800 !mt-4 !mb-2">{parseInline(line.slice(2, -2))}</h4>);
        } else if (line.trim()) {
          blocks.push(<p key={index}>{parseInline(line)}</p>);
        }
      }
    });

    flushList();
    return blocks;
  };
  
  const viewHistoryItem = (plant: ScannedPlant) => {
    setPreviewUrl(plant.imageDataUrl);
    setResult(plant.analysisResult);
    setImageFile(null);
    window.scrollTo(0, 0);
  };

  return (
     <div className="space-y-6 pb-20">
        {showNotification && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-green-600 text-white p-3 rounded-lg shadow-lg text-center z-50 animate-fade-in-down">
                Diagnosis saved to your history! 🌱
            </div>
        )}
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Crop Disease Scanner</h2>
            <p className="text-gray-600 mt-1 text-sm">Upload a leaf image for an instant AI diagnosis.</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
            <label htmlFor="image-upload" className="cursor-pointer w-full">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-lime-500 transition-colors">
                {previewUrl ? (
                  <img src={previewUrl} alt="Plant preview" className="mx-auto h-48 w-48 object-cover rounded-md" />
                ) : (
                  <div className="flex flex-col items-center text-gray-500 py-8">
                    <Icon name="upload" className="w-10 h-10 mb-2"/>
                    <span className="font-semibold">Tap to upload image</span>
                    <span className="text-xs">PNG, JPG, WEBP</span>
                  </div>
                )}
              </div>
            </label>
            <input id="image-upload" type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
        </div>
         <button
            onClick={handleAnalyze}
            disabled={!imageFile || isLoading}
            className="w-full flex items-center justify-center bg-lime-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-lime-700 transition-transform transform active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? <Spinner /> : <><Icon name="scan" className="w-5 h-5 mr-2"/>Analyze Plant</>}
          </button>

         {error && <div className="text-red-600 bg-red-100 p-4 rounded-lg w-full text-left text-sm">{error}</div>}

        {(isLoading || result) && (
            <div className="w-full bg-white p-6 rounded-xl border border-gray-200 min-h-[150px]">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Analysis Result</h3>
              {isLoading && !result && (
                  <div className="flex flex-col items-center justify-center text-gray-500 py-10">
                      <Spinner />
                      <p className="mt-2 text-sm">Analyzing image...</p>
                  </div>
              )}
              {result && <div className="text-gray-700 space-y-3 prose prose-sm max-w-none">{renderFormattedText(result)}</div>}
            </div>
        )}

        {history.length > 0 && (
            <div className="w-full bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Icon name="history" className="w-6 h-6 mr-2 text-gray-600" />
                    Scan History
                </h3>
                <div className="space-y-3">
                    {history.map(plant => (
                        <div key={plant.id} className="flex items-center p-2 rounded-lg bg-gray-50 hover:bg-gray-100">
                            <img src={plant.imageDataUrl} alt="Scanned plant" className="w-12 h-12 object-cover rounded-md mr-4" />
                            <div className="flex-grow">
                                <p className="text-sm font-semibold text-gray-800">Scan from:</p>
                                <p className="text-xs text-gray-500">{plant.timestamp}</p>
                            </div>
                            <button onClick={() => viewHistoryItem(plant)} className="text-lime-600 font-semibold text-sm hover:underline">
                                View
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};

export default DiseaseDetector;
