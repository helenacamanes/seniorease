export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';
  simplifiedMode: boolean;
  extraConfirmation: boolean;
  reminderFrequency: 'none' | 'daily' | 'weekly';
  enhancedFeedback: boolean;
}