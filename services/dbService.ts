import { ScannedPlant } from '../types';

const DB_KEY = 'agriGeniusScannedPlants';

const getScannedPlants = async (): Promise<ScannedPlant[]> => {
  try {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error fetching plants from localStorage:', error);
    return [];
  }
};

const saveScannedPlant = async (plant: ScannedPlant): Promise<void> => {
  try {
    const existingPlants = await getScannedPlants();
    const updatedPlants = [...existingPlants, plant];
    localStorage.setItem(DB_KEY, JSON.stringify(updatedPlants));
  } catch (error) {
    console.error('Error saving plant to localStorage:', error);
  }
};

export const dbService = {
  getScannedPlants,
  saveScannedPlant,
};
