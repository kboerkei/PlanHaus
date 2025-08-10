import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "../lib/analytics";

export const useAnalytics = (): void => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string>(location);
  
  useEffect(() => {
    if (location !== prevLocationRef.current) {
      // Add a small delay to ensure the page title has been updated
      setTimeout(() => {
        trackPageView(location, document.title);
      }, 100);
      
      prevLocationRef.current = location;
    }
  }, [location]);
};

// Hook for tracking user interactions
export const useEventTracking = () => {
  return {
    trackClick: (elementName: string, additionalProps?: Record<string, any>) => {
      // Track clicks with context
      import("../lib/analytics").then(({ trackEvent }) => {
        trackEvent("click", {
          category: "interaction",
          label: elementName,
          ...additionalProps,
        });
      });
    },
    
    trackFormSubmit: (formName: string, success: boolean, additionalProps?: Record<string, any>) => {
      import("../lib/analytics").then(({ trackEvent }) => {
        trackEvent(success ? "form_submit_success" : "form_submit_error", {
          category: "form",
          label: formName,
          ...additionalProps,
        });
      });
    },
    
    trackFeatureUse: (featureName: string, additionalProps?: Record<string, any>) => {
      import("../lib/analytics").then(({ trackEvent }) => {
        trackEvent("feature_use", {
          category: "features",
          label: featureName,
          ...additionalProps,
        });
      });
    },
  };
};