/**
 * Utility functions for handling local image storage
 * Images are stored in browser localStorage as Base64 strings
 */

export const imageStorage = {
  /**
   * Store a poll image locally
   */
  storePollImage: (pollId: number, imageData: string): void => {
    try {
      localStorage.setItem(`poll_${pollId}`, imageData);
    } catch (error) {
      console.error('Failed to store poll image:', error);
    }
  },

  /**
   * Retrieve a poll image from local storage
   */
  getPollImage: (pollId: number): string | null => {
    try {
      return localStorage.getItem(`poll_${pollId}`);
    } catch (error) {
      console.error('Failed to retrieve poll image:', error);
      return null;
    }
  },

  /**
   * Store a candidate image locally
   */
  storeCandidateImage: (pollId: number, candidateName: string, imageData: string): void => {
    try {
      localStorage.setItem(`candidate_${pollId}_${candidateName}`, imageData);
    } catch (error) {
      console.error('Failed to store candidate image:', error);
    }
  },

  /**
   * Retrieve a candidate image from local storage
   */
  getCandidateImage: (pollId: number, candidateName: string): string | null => {
    try {
      return localStorage.getItem(`candidate_${pollId}_${candidateName}`);
    } catch (error) {
      console.error('Failed to retrieve candidate image:', error);
      return null;
    }
  },

  /**
   * Convert a File to Base64 string
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Generate a simple hash from filename for blockchain storage
   */
  generateImageHash: (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  },

  /**
   * Clear all stored images (useful for cleanup)
   */
  clearAllImages: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('poll_') || key.startsWith('candidate_')) {
        localStorage.removeItem(key);
      }
    });
  }
};
