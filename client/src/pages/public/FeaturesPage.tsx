import { SEOHead, seoConfigs } from "@/components/seo/SEOHead";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { trackEvent } from "@/lib/analytics";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Bot, 
  Heart, 
  Palette, 
  MessageCircle, 
  CheckCircle, 
  Sparkles,
  Clock
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Bot,
      title: "AI Wedding Assistant",
      description: "Get personalized recommendations, timeline suggestions, and instant answers to your wedding planning questions.",
      highlights: ["24/7 availability", "Personalized advice", "Budget optimization"]
    },
    {
      icon: Calendar,
      title: "Smart Timeline Management",
      description: "AI-generated wedding timelines with task prioritization and deadline reminders.",
      highlights: ["Auto-generated tasks", "Priority sorting", "Deadline alerts"]
    },
    {
      icon: DollarSign,
      title: "Budget Tracking & Analytics",
      description: "Track expenses, get spending insights, and receive budget alerts to stay on track.",
      highlights: ["Real-time tracking", "Category breakdown", "Cost predictions"]
    },
    {
      icon: Users,
      title: "Guest Management Suite",
      description: "Manage RSVPs, dietary restrictions, seating arrangements, and guest communication.",
      highlights: ["RSVP tracking", "Seating charts", "Guest preferences"]
    },
    {
      icon: Palette,
      title: "Creative Design Tools",
      description: "Create mood boards, color palettes, and style guides for your wedding aesthetic.",
      highlights: ["Mood boards", "Color coordination", "Style templates"]
    },
    {
      icon: MessageCircle,
      title: "Real-time Collaboration",
      description: "Work together with your partner, family, and wedding party in real-time.",
      highlights: ["Live updates", "Comment system", "Role permissions"]
    }
  ];

  const handleCTAClick = (ctaType: string) => {
    trackEvent("cta_click", {
      category: "features_page",
      label: ctaType,
      page: "/features"
    });
  };

  return (
    <>
      <SEOHead {...seoConfigs.features} />
      
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered Wedding Planning
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to Plan Your
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent block">
                Perfect Wedding
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              From AI-powered recommendations to collaborative planning tools, PlanHaus provides everything couples need to create their dream wedding stress-free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EnhancedButton 
                size="lg"
                variant="wedding"
                onClick={() => handleCTAClick("start_planning")}
              >
                Start Planning Free
              </EnhancedButton>
              <EnhancedButton 
                size="lg"
                variant="outline"
                onClick={() => handleCTAClick("view_demo")}
              >
                View Demo
              </EnhancedButton>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Wedding Planning Tools
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Every feature designed to make wedding planning enjoyable, organized, and stress-free.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <EnhancedCard 
                  key={index} 
                  variant="elegant"
                  className="p-6 h-full hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-rose-100 rounded-lg">
                      <feature.icon className="h-6 w-6 text-rose-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </EnhancedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Trusted by Couples Worldwide
              </h2>
              <p className="text-lg text-rose-100">
                Join thousands of couples who've planned their perfect day with PlanHaus
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: "10,000+", label: "Weddings Planned" },
                { number: "98%", label: "Couples Satisfied" },
                { number: "30%", label: "Average Cost Savings" },
                { number: "200+", label: "Hours Saved" }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-rose-100">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Start Planning Your Dream Wedding?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join PlanHaus today and experience stress-free wedding planning with AI-powered tools and expert guidance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <EnhancedButton 
                size="lg"
                variant="wedding"
                onClick={() => handleCTAClick("get_started")}
              >
                Get Started Free
              </EnhancedButton>
              <EnhancedButton 
                size="lg"
                variant="outline"
                onClick={() => handleCTAClick("contact_sales")}
              >
                Contact Sales
              </EnhancedButton>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}