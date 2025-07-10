export async function trackEvent(event: string, data: Record<string, any> = {}) {
  try {
    await fetch(`${import.meta.env.VITE_API_URL}/analytics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, data }),
    });
  } catch (error) {
    console.error("Failed to track analytics event:", error);
  }
}

// Predefined event types for consistency
export const AnalyticsEvents = {
  PLAY_CREATED: "play_created",
  SIGNAL_LOGGED: "signal_logged",
  RNR_SAVED: "rnr_saved",
  FEATURE_TOGGLED: "feature_toggled",
  INVITE_SENT: "invite_sent",
  INVITE_ACCEPTED: "invite_accepted",
  WAITLIST_JOINED: "waitlist_joined",
  DEMO_LOGIN: "demo_login",
  PAGE_VIEW: "page_view",
  SETTINGS_UPDATED: "settings_updated",
  PASSWORD_RESET_REQUESTED: "password_reset_requested",
  PASSWORD_RESET_COMPLETED: "password_reset_completed",
  PREMIUM_UPGRADE_CLICKED: "premium_upgrade_clicked",
  PREMIUM_CONTENT_ACCESSED: "premium_content_accessed",
} as const;

// Hook for easy access to tracking function
export function useAnalytics() {
  return { trackEvent };
} 