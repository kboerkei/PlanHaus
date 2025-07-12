import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, CheckCircle } from "lucide-react";

const timelineItems = [
  {
    id: 1,
    week: "12 months before",
    title: "Set the Date & Budget",
    description: "Choose your wedding date and establish your overall budget",
    category: "Planning",
    priority: "high",
    completed: true,
    tasks: [
      "Book venue",
      "Set guest count",
      "Establish budget"
    ]
  },
  {
    id: 2,
    week: "10 months before",
    title: "Book Major Vendors",
    description: "Secure your key vendors like photographer, caterer, and florist",
    category: "Vendors",
    priority: "high",
    completed: false,
    tasks: [
      "Book photographer",
      "Book caterer",
      "Book florist",
      "Book band/DJ"
    ]
  },
  {
    id: 3,
    week: "8 months before",
    title: "Send Save the Dates",
    description: "Announce your wedding date to friends and family",
    category: "Communication",
    priority: "medium",
    completed: false,
    tasks: [
      "Design save the dates",
      "Collect addresses",
      "Mail save the dates"
    ]
  },
  {
    id: 4,
    week: "6 months before",
    title: "Choose Wedding Attire",
    description: "Select and order wedding dress, suit, and accessories",
    category: "Attire",
    priority: "high",
    completed: false,
    tasks: [
      "Choose wedding dress",
      "Order groom's suit",
      "Select shoes and accessories"
    ]
  },
  {
    id: 5,
    week: "4 months before",
    title: "Send Invitations",
    description: "Mail wedding invitations and manage RSVPs",
    category: "Communication",
    priority: "high",
    completed: false,
    tasks: [
      "Design invitations",
      "Mail invitations",
      "Track RSVPs"
    ]
  }
];

const priorityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800"
};

export default function Timeline() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                  Wedding Timeline
                </h1>
                <p className="text-gray-600">
                  Your personalized wedding planning roadmap
                </p>
              </div>
              <Button className="gradient-blush-rose text-white">
                <Plus size={16} className="mr-2" />
                Add Milestone
              </Button>
            </div>

            {/* Timeline Overview */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="text-blush" size={24} />
                  <span>Timeline Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blush">5</div>
                    <div className="text-sm text-gray-600">Total Milestones</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4</div>
                    <div className="text-sm text-gray-600">Upcoming</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Items */}
            <div className="space-y-6">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* Timeline line */}
                  {index < timelineItems.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <Card className={`ml-12 ${item.completed ? 'bg-green-50 border-green-200' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Timeline dot */}
                        <div className={`absolute -left-6 w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                          item.completed ? 'bg-green-500' : 'bg-blush'
                        }`}>
                          {item.completed ? (
                            <CheckCircle className="text-white" size={20} />
                          ) : (
                            <Clock className="text-white" size={20} />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold text-lg text-gray-800">
                                {item.title}
                              </h3>
                              <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                                {item.priority}
                              </Badge>
                            </div>
                            <span className="text-sm font-medium text-blush">
                              {item.week}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-4">{item.description}</p>
                          
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Tasks:</h4>
                            <ul className="space-y-1">
                              {item.tasks.map((task, taskIndex) => (
                                <li key={taskIndex} className="flex items-center space-x-2 text-sm">
                                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                  <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                                    {task}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <Badge variant="outline" className="text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
