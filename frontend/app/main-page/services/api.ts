const API_BASE_URL = 'http://localhost:3000/v1';

export interface AIAnalysis {
  complaints: { [key: string]: number };
  positives: { [key: string]: number };
  newsfeed: string[];
}

export interface SuburbAnalysis {
  [key: string]: AIAnalysis;
}

export interface StoredAnalysis {
  suburb: string;
  complaints: { [key: string]: number };
  positives: { [key: string]: number };
  newsfeed: string[];
  weather: any;
  pollution: any;
  lastUpdated: string;
}

export const apiService = {
  // Get AI analysis for all suburbs
  async getAnalysisForAll(): Promise<SuburbAnalysis> {
    try {
      const response = await fetch(`${API_BASE_URL}/citysense/analyze/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.analysis || {};
    } catch (error) {
      console.error('Error fetching analysis for all suburbs:', error);
      return {};
    }
  },

  // Get AI analysis for specific suburb
  async getAnalysisForSuburb(suburb: string): Promise<AIAnalysis | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/citysense/analyze?suburb=${encodeURIComponent(suburb)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.analysis || null;
    } catch (error) {
      console.error(`Error fetching analysis for ${suburb}:`, error);
      return null;
    }
  },

  // Get stored analysis results
  async getStoredAnalysis(suburb: string): Promise<StoredAnalysis | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/citysense/analysis/stored?suburb=${encodeURIComponent(suburb)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || null;
    } catch (error) {
      console.error(`Error fetching stored analysis for ${suburb}:`, error);
      return null;
    }
  },

  // Get all stored analysis results
  async getAllStoredAnalysis(): Promise<StoredAnalysis[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/citysense/analysis/all-stored`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching all stored analysis:', error);
      return [];
    }
  },

  // Get combined suburb data (weather, pollution, moods)
  async getCombinedSuburbData(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/citysense/data/combined`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error fetching combined suburb data:', error);
      return {};
    }
  },

  // Get mood data for a suburb
  async getMoodData(suburb: string): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/citysense/data/moods?suburb=${encodeURIComponent(suburb)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error(`Error fetching mood data for ${suburb}:`, error);
      return [];
    }
  }
};
