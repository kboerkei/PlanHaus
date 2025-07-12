import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Plus, TrendingUp, AlertTriangle } from "lucide-react";

const budgetCategories = [
  {
    id: 1,
    category: "Venue",
    estimated: 12000,
    actual: 11500,
    percentage: 34,
    status: "under"
  },
  {
    id: 2,
    category: "Catering",
    estimated: 8000,
    actual: 8500,
    percentage: 24,
    status: "over"
  },
  {
    id: 3,
    category: "Photography",
    estimated: 3500,
    actual: 3200,
    percentage: 10,
    status: "under"
  },
  {
    id: 4,
    category: "Flowers",
    estimated: 2000,
    actual: 0,
    percentage: 6,
    status: "pending"
  },
  {
    id: 5,
    category: "Music/DJ",
    estimated: 1500,
    actual: 1500,
    percentage: 4,
    status: "exact"
  },
  {
    id: 6,
    category: "Attire",
    estimated: 2500,
    actual: 2200,
    percentage: 7,
    status: "under"
  },
  {
    id: 7,
    category: "Transportation",
    estimated: 800,
    actual: 0,
    percentage: 2,
    status: "pending"
  },
  {
    id: 8,
    category: "Miscellaneous",
    estimated: 4700,
    actual: 1100,
    percentage: 13,
    status: "under"
  }
];

const totalBudget = 35000;
const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.actual, 0);
const remaining = totalBudget - totalSpent;

export default function Budget() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over':
        return 'text-red-600 bg-red-50';
      case 'under':
        return 'text-green-600 bg-green-50';
      case 'exact':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over':
        return <AlertTriangle size={16} className="text-red-600" />;
      case 'under':
        return <TrendingUp size={16} className="text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        
        <div className="p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-serif text-3xl font-semibold text-gray-800 mb-2">
                  Wedding Budget
                </h1>
                <p className="text-gray-600">
                  Track your spending and stay on budget
                </p>
              </div>
              <Button className="gradient-blush-rose text-white">
                <Plus size={16} className="mr-2" />
                Add Expense
              </Button>
            </div>

            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="text-blush" size={20} />
                    <span>Total Budget</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    ${totalBudget.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <span>Spent</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    ${totalSpent.toLocaleString()}
                  </div>
                  <Progress 
                    value={(totalSpent / totalBudget) * 100} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <DollarSign className="text-blue-600" size={20} />
                    <span>Remaining</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-800">
                    ${remaining.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {Math.round(((totalBudget - totalSpent) / totalBudget) * 100)}% of budget
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Budget Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Budget Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {budgetCategories.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">{item.category}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Estimated: ${item.estimated.toLocaleString()}</span>
                          <span>Actual: ${item.actual.toLocaleString()}</span>
                          <span>{item.percentage}% of budget</span>
                        </div>
                        
                        <Progress 
                          value={(item.actual / item.estimated) * 100} 
                          className="mt-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
