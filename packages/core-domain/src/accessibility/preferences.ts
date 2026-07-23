export interface AccessibilityPreferences {
  fontSize: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
  spacing: 'normal' | 'wide';

  basicMode: boolean;
  enhancedFeedback: boolean;
  requireConfirmation: boolean;
  reduceAnimations: boolean;

  notificationsEnabled: boolean;
  reminderTime: string;
}