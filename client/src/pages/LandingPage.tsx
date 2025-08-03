import React from 'react';
import { Link } from 'wouter';
import { 
  Heart, CheckCircle, Users, Calendar, PiggyBank, Sparkles, 
  ArrowRight, Star, MessageCircle, Instagram, MapPin, Mail,
  ChevronDown, Play, Zap, Target, Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-champagne-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-sm border-b border-rose-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <span className="text-2xl font-serif font-bold text-gray-900">PlanHaus</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                  Log In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                  Try Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight">
                  A Smarter Way to Plan Your{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">
                    Best Day
                  </span>{' '}
                  — With AI That Gets You
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform wedding planning from overwhelming to organized with personalized AI assistance, 
                  comprehensive budget tracking, and beautiful collaboration tools that make your dream day effortless.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-4 text-lg group">
                    Try Now — It's Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50 px-8 py-4 text-lg group">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-rose-200 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-pink-200 rounded-full border-2 border-white"></div>
                    <div className="w-8 h-8 bg-purple-200 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-sm text-gray-600">10K+ happy couples</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">4.9/5 rating</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border border-rose-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Emma & Jake's Wedding</h3>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">78% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-rose-600">127</div>
                      <div className="text-sm text-gray-600">Days to go</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">$32K</div>
                      <div className="text-sm text-gray-600">Budget on track</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Book venue</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-600">Send invitations</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-sm"></div>
                      <span className="text-sm text-gray-600">Final dress fitting</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating AI Assistant */}
              <div className="absolute -right-4 -top-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg max-w-xs">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium">AI Suggestion</div>
                    <div className="text-xs opacity-90">Book your florist soon! Popular vendors fill up 6 months ahead.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900">
              Everything You Need in One Beautiful Place
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From AI-powered planning to budget tracking, PlanHaus brings together all the tools 
              couples need to plan their perfect wedding day.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Sparkles,
                title: "AI Planning Assistant",
                description: "Get personalized recommendations, smart timeline suggestions, and intelligent vendor matching based on your style and budget."
              },
              {
                icon: PiggyBank,
                title: "Smart Budget Tracker",
                description: "Stay on budget with real-time expense tracking, automatic calculations, and alerts when you're approaching limits."
              },
              {
                icon: Users,
                title: "Vendor & Guest Management",
                description: "Organize your entire wedding party and vendor list with contact management, RSVP tracking, and communication tools."
              },
              {
                icon: Calendar,
                title: "Custom Timeline & Checklist",
                description: "Never miss a deadline with AI-generated timelines, customizable checklists, and automatic reminders."
              },
              {
                icon: Heart,
                title: "Moodboard & Inspiration",
                description: "Collect and organize inspiration with beautiful moodboards, color palette tools, and style matching."
              },
              {
                icon: MessageCircle,
                title: "Real-time Collaboration",
                description: "Work together seamlessly with your partner, family, and wedding planner with live updates and comments."
              }
            ].map((feature, index) => (
              <Card key={index} className="border-rose-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-rose-100 to-pink-100 rounded-2xl flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900">
              Get Started in Minutes
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to your perfectly organized wedding
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sign up and tell us about your event",
                description: "Share your wedding vision, budget, and preferences. Our AI learns what matters most to you."
              },
              {
                step: "02", 
                title: "Get your personalized wedding plan instantly",
                description: "Receive a custom timeline, budget breakdown, and vendor recommendations tailored to your needs."
              },
              {
                step: "03",
                title: "Track, update, and collaborate until the big day",
                description: "Work with your partner and vendors in real-time. Check off tasks and watch your dream come together."
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-8">
                    <ArrowRight className="h-6 w-6 text-rose-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900">
              Loved by Couples Everywhere
            </h2>
            <p className="text-xl text-gray-600">
              See what real couples say about planning with PlanHaus
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "PlanHaus saved our sanity! The AI suggestions were spot-on and helped us stay within budget while planning our dream wedding.",
                author: "Sarah & Michael",
                location: "San Francisco, CA",
                rating: 5
              },
              {
                quote: "The collaboration features made it so easy to work with our families. Everyone could see updates in real-time. Game changer!",
                author: "Emily & David",
                location: "Austin, TX", 
                rating: 5
              },
              {
                quote: "I was overwhelmed until I found PlanHaus. The timeline feature kept us on track and the budget tracker was incredibly helpful.",
                author: "Jessica & Ryan",
                location: "New York, NY",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="border-rose-100">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-serif font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Do I need to pay to use PlanHaus?",
                answer: "PlanHaus offers a free tier with essential planning tools. Premium features like advanced AI recommendations and unlimited collaborators are available with our paid plans."
              },
              {
                question: "Can I collaborate with my partner and family?",
                answer: "Absolutely! PlanHaus is built for collaboration. Invite your partner, family members, and wedding planner to work together in real-time with different permission levels."
              },
              {
                question: "Does this work for other events besides weddings?",
                answer: "While PlanHaus is optimized for weddings, many couples use it successfully for engagement parties, bridal showers, and other special events."
              },
              {
                question: "How secure is my wedding information?",
                answer: "We take privacy seriously. All your data is encrypted and stored securely. We never share your personal information with third parties without your consent."
              },
              {
                question: "Can I access PlanHaus on my phone?",
                answer: "Yes! PlanHaus is fully responsive and works beautifully on desktop, tablet, and mobile devices. Plan on-the-go with our mobile-optimized interface."
              }
            ].map((faq, index) => (
              <Card key={index} className="border-rose-100">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-rose-500 to-pink-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-white">
            <h2 className="text-4xl font-serif font-bold">
              Ready to Plan Your Perfect Day?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of couples who've made wedding planning effortless with PlanHaus
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-white text-rose-600 hover:bg-gray-50 px-8 py-4 text-lg">
                  Start Planning for Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-rose-600 px-8 py-4 text-lg">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-rose-400" />
                <span className="text-xl font-serif font-bold">PlanHaus</span>
              </div>
              <p className="text-gray-400">
                Making wedding planning beautiful, organized, and stress-free for couples everywhere.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Product</h3>
              <div className="space-y-2 text-gray-400">
                <div>Features</div>
                <div>Pricing</div>
                <div>Templates</div>
                <div>Integrations</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Wedding Guides</div>
                <div>Privacy Policy</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Connect</h3>
              <div className="flex space-x-4">
                <Instagram className="h-6 w-6 text-gray-400 hover:text-rose-400 cursor-pointer" />
                <MapPin className="h-6 w-6 text-gray-400 hover:text-rose-400 cursor-pointer" />
                <Mail className="h-6 w-6 text-gray-400 hover:text-rose-400 cursor-pointer" />
              </div>
              <div className="text-gray-400">
                <div>hello@planhaus.com</div>
                <div>1-800-PLANHAUS</div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400">
              © 2025 PlanHaus. All rights reserved.
            </div>
            <div className="flex space-x-6 text-gray-400 mt-4 md:mt-0">
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
              <span>Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}