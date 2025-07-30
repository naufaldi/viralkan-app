// Tones API service - Single source of truth from backend

export interface ToneConfig {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface TonesResponse {
  tones: ToneConfig[];
}

class TonesAPI {
  private baseUrl: string;
  private cache: ToneConfig[] | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  /**
   * Get available tones from the backend API
   * Uses caching to avoid repeated requests
   */
  async getAvailableTones(): Promise<ToneConfig[]> {
    // Return cached data if available
    if (this.cache) {
      return this.cache;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/sharing/tones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: TonesResponse = await response.json();

      // Cache the result
      this.cache = data.tones;

      return data.tones;
    } catch (error) {
      console.error("Failed to fetch tones from API:", error);

      // Fallback to hardcoded tones if API fails
      const fallbackTones: ToneConfig[] = [
        {
          value: "formal",
          label: "Formal",
          description: "Bahasa resmi untuk pemerintah",
          icon: "building",
        },
        {
          value: "urgent",
          label: "Urgent",
          description: "Mendesak untuk perbaikan cepat",
          icon: "alert-circle",
        },
        {
          value: "community",
          label: "Community",
          description: "Ramah untuk komunitas",
          icon: "users",
        },
        {
          value: "informative",
          label: "Informative",
          description: "Informatif dengan data",
          icon: "bar-chart",
        },
      ];

      this.cache = fallbackTones;
      return fallbackTones;
    }
  }

  /**
   * Clear the cache (useful for development or testing)
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Get a specific tone by value
   */
  async getToneByValue(value: string): Promise<ToneConfig | undefined> {
    const tones = await this.getAvailableTones();
    return tones.find((tone) => tone.value === value);
  }
}

// Export singleton instance
export const tonesAPI = new TonesAPI();

// Export types for convenience
export type Tone = ToneConfig["value"];
