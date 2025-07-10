// Mock authentication system using localStorage for development

export interface MockUser {
  id: number;
  firebase_uid: string;
  email: string;
  name: string;
  avatar_url: string | null;
  provider: "google" | "facebook" | "email";
  created_at: string;
}

const STORAGE_KEY = "viralkan_mock_user";

// Mock user data for testing
const mockUserData: MockUser = {
  id: 1,
  firebase_uid: "mock_firebase_uid_123",
  email: "user@example.com",
  name: "John Doe",
  avatar_url: "https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff",
  provider: "google",
  created_at: new Date().toISOString(),
};

export class MockAuth {
  private static instance: MockAuth;
  private user: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  private constructor() {
    // Load user from localStorage on initialization
    this.loadUserFromStorage();
  }

  static getInstance(): MockAuth {
    if (!MockAuth.instance) {
      MockAuth.instance = new MockAuth();
    }
    return MockAuth.instance;
  }

  private loadUserFromStorage() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    } catch (error) {
      console.error("Failed to load user from localStorage:", error);
      this.user = null;
    }
  }

  private saveUserToStorage(user: MockUser | null) {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save user to localStorage:", error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.user));
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this.listeners.push(callback);
    
    // Call immediately with current state
    callback(this.user);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Simulate Google OAuth login
  async signInWithGoogle(): Promise<MockUser> {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        this.user = {
          ...mockUserData,
          created_at: new Date().toISOString(),
        };
        
        this.saveUserToStorage(this.user);
        this.notifyListeners();
        resolve(this.user);
      }, 1000);
    });
  }

  // Sign out
  async signOut(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.user = null;
        this.saveUserToStorage(null);
        this.notifyListeners();
        resolve();
      }, 500);
    });
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.user !== null;
  }

  // Get mock Firebase token (for API calls)
  async getIdToken(): Promise<string | null> {
    if (!this.user) return null;
    
    // Return a mock JWT token
    return `mock_firebase_token_${this.user.firebase_uid}_${Date.now()}`;
  }
}

// Export singleton instance
export const mockAuth = MockAuth.getInstance();