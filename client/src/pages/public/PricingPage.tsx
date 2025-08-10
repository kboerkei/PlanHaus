import { SEOHead, seoConfigs } from "@/components/seo/SEOHead";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";
import { Check, Star, Crown, Heart } from "lucide-react";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for small, simple weddings",
      features: [
        "Up to 50 guests",
        "Basic timeline & checklist",
        "Budget tracking",
        "1 project",
        "Mobile app access",
        "Email support"
      ],
      limitations: [
        "Limited AI features",
        "Basic templates only",
        "No collaboration tools"
      ],
      cta: "Get Started Free",
      popular: false,
      icon: Heart
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "Everything you need for a perfect wedding",
      features: [
        "Unlimited guests",
        "Full AI wedding assistant",
        "Advanced timeline management",
        "Vendor recommendations",
        "Real-time collaboration",
        "Custom seating charts",
        "Mood boards & design tools",
        "Priority email support",
        "Export to PDF/Excel",
        "Unlimited projects"
      ],
      limitations: [],
      cta: "Start Free Trial",
      popular: true,
      icon: Star
    },
    {
      name: "Premium",
      price: "$39",
      period: "per month",
      description: "For couples who want the ultimate experience",
      features: [
        "Everything in Pro",
        "Dedicated wedding coordinator",
        "Personal video consultations",
        "Custom vendor sourcing",
        "Advanced analytics & insights",
        "White-label sharing",
        "API access",
        "Phone support",
        "Custom integrations",
        "Wedding website builder"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false,
      icon: Crown
    }
  ];

  const handlePlanSelect = (planName: string, action: string) => {
    trackEvent("plan_selected", {
      category: "pricing",
      label: planName,
      action: action,
      page: "/pricing"
    });
  };

  return (
    <>
      <SEOHead {...seoConfigs.pricing} />
      
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple, Transparent
              <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent block">
                Wedding Planning Pricing
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your wedding. Start free and upgrade as your planning needs grow.
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <span className="text-sm text-gray-600">Monthly</span>
              <div className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-sm font-medium">
                Save 20% with annual billing
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              {plans.map((plan, index) => (
                <div key={index} className="relative">
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-4 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <EnhancedCard 
                    variant="elegant" 
                    className={`p-8 h-full relative overflow-hidden ${
                      plan.popular ? 'ring-2 ring-rose-500 shadow-xl scale-105' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-rose-100 rounded-lg">
                        <plan.icon className="h-6 w-6 text-rose-600" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                        <p className="text-gray-600 text-sm">{plan.description}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600">/{plan.period}</span>
                      </div>
                    </div>

                    <EnhancedButton
                      variant={plan.popular ? "wedding" : "outline"}
                      className="w-full mb-8"
                      onClick={() => handlePlanSelect(plan.name, plan.cta)}
                    >
                      {plan.cta}
                    </EnhancedButton>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {plan.limitations.length > 0 && (
                        <div className="pt-4 mt-4 border-t border-gray-200">
                          <h4 className="font-medium text-gray-600 mb-2 text-sm">Limitations:</h4>
                          <ul className="space-y-1">
                            {plan.limitations.map((limitation, idx) => (
                              <li key={idx} className="text-sm text-gray-500">
                                • {limitation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </EnhancedCard>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600">
                Everything you need to know about our pricing and plans.
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  question: "Can I change plans at any time?",
                  answer: "Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
                },
                {
                  question: "What happens to my data if I cancel?",
                  answer: "Your data remains accessible for 30 days after cancellation. You can export all your wedding plans, guest lists, and other information before your account is permanently deleted."
                },
                {
                  question: "Is there a free trial for paid plans?",
                  answer: "Yes! All paid plans include a 14-day free trial. No credit card required to start, and you can cancel anytime during the trial period."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied within the first 30 days, contact us for a full refund."
                },
                {
                  question: "Can multiple people collaborate on one account?",
                  answer: "Yes! Pro and Premium plans include unlimited collaboration with your partner, family members, and wedding party. Each collaborator gets their own login and personalized permissions."
                }
              ].map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Start Planning Your Dream Wedding?
            </h2>
            <p className="text-lg text-rose-100 mb-8">
              Join thousands of couples who trust PlanHaus for their special day.
            </p>
            
            <EnhancedButton 
              size="lg"
              variant="secondary"
              className="bg-white text-rose-600 hover:bg-gray-50"
              onClick={() => handlePlanSelect("Free", "Start Free")}
            >
              Start Free Today
            </EnhancedButton>
          </div>
        </section>
      </div>
    </>
  );
}