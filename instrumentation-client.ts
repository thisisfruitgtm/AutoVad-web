import posthog from "posthog-js"

// Use the same PostHog API key for cross-platform consistency
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  capture_pageview: 'history_change',
  capture_pageleave: true,
  capture_exceptions: true,
  debug: process.env.NODE_ENV === "development",
  // Cross-platform properties
  loaded: (posthog) => {
    // Set platform-specific properties without user identification
    // User identification will be handled by the auth hook
    posthog.setPersonProperties({
      platform: 'web',
      user_agent: navigator.userAgent,
      screen_resolution: `${screen.width}x${screen.height}`,
      browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : 
               navigator.userAgent.includes('Firefox') ? 'Firefox' : 
               navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
      locale: navigator.language,
    });
  },
});

export default posthog;
