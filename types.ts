export type View = 'dashboard' | 'disease' | 'chat' | 'planting';

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface ScannedPlant {
  id: string;
  imageDataUrl: string;
  analysisResult: string;
  timestamp: string;
}
