import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  siteName?: string;
  twitterCard?: "summary" | "summary_large_image";
  noIndex?: boolean;
}

export function SEOHead({
  title = "PlanHaus - AI-Powered Wedding Planning Made Simple",
  description = "Transform your wedding planning experience with PlanHaus. Get AI-powered recommendations, collaborate with your partner, and create your perfect day with our comprehensive wedding planning tools.",
  image = "/og-image.png",
  url,
  type = "website",
  siteName = "PlanHaus",
  twitterCard = "summary_large_image",
  noIndex = false,
}: SEOHeadProps): null {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Create or update meta tags
    const updateMetaTag = (name: string, content: string, property = false): void => {
      const attribute = property ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Basic meta tags
    updateMetaTag("description", description);
    
    if (noIndex) {
      updateMetaTag("robots", "noindex, nofollow");
    } else {
      updateMetaTag("robots", "index, follow");
    }

    // Open Graph tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:site_name", siteName, true);
    
    if (image) {
      updateMetaTag("og:image", image, true);
      updateMetaTag("og:image:alt", `${title} - Wedding Planning`, true);
      updateMetaTag("og:image:width", "1200", true);
      updateMetaTag("og:image:height", "630", true);
    }
    
    if (url) {
      updateMetaTag("og:url", url, true);
    }

    // Twitter Card tags
    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    
    if (image) {
      updateMetaTag("twitter:image", image);
      updateMetaTag("twitter:image:alt", `${title} - Wedding Planning`);
    }

    // Additional meta tags
    updateMetaTag("theme-color", "#e11d48");
    updateMetaTag("viewport", "width=device-width, initial-scale=1");
    
    // Canonical link
    if (url) {
      let canonical = document.querySelector("link[rel='canonical']");
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
    }
  }, [title, description, image, url, type, siteName, twitterCard, noIndex]);

  return null;
}

// Predefined SEO configurations for different pages
export const seoConfigs = {
  home: {
    title: "PlanHaus - AI-Powered Wedding Planning Made Simple",
    description: "Transform your wedding planning experience with PlanHaus. Get AI-powered recommendations, collaborate with your partner, and create your perfect day with our comprehensive wedding planning tools.",
    url: "/",
  },
  features: {
    title: "Wedding Planning Features | PlanHaus",
    description: "Discover PlanHaus's comprehensive wedding planning features: AI recommendations, budget tracking, guest management, vendor coordination, and real-time collaboration tools.",
    url: "/features",
  },
  pricing: {
    title: "Wedding Planning Pricing | PlanHaus",
    description: "Choose the perfect PlanHaus plan for your wedding. Free basic tools or premium features with AI assistance, unlimited guests, and advanced collaboration.",
    url: "/pricing",
  },
  about: {
    title: "About PlanHaus | Your AI Wedding Planning Partner",
    description: "Learn about PlanHaus's mission to make wedding planning stress-free and enjoyable through intelligent automation and personalized guidance.",
    url: "/about",
  },
  blog: {
    title: "Wedding Planning Blog | Tips & Inspiration | PlanHaus",
    description: "Get expert wedding planning advice, inspiration, and tips from PlanHaus. From budget management to venue selection, we've got you covered.",
    url: "/blog",
  },
  contact: {
    title: "Contact PlanHaus | Wedding Planning Support",
    description: "Get in touch with PlanHaus for wedding planning support, partnership inquiries, or feature requests. We're here to help make your day perfect.",
    url: "/contact",
  },
};