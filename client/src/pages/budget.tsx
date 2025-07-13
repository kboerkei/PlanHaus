import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import LoadingSpinner from "@/components/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Plus, TrendingUp, AlertTriangle } from "lucide-react";

export default function Budget() {
  // Fetch wedding project data
  const { data: weddingProjects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/wedding-projects'],
  });

  // Fetch budget items
  const { data: budgetItems, isLoading: budgetLoading } = useQuery({
    queryKey: ['/api/budget-items'],
    enabled: !!weddingProjects && weddingProjects.length > 0,
  });

  const currentProject = weddingProjects?.[0];
  const totalBudget = currentProject?.budget ? parseFloat(currentProject.budget) : 0;
  const totalSpent = budgetItems?.reduce((sum: number, item: any) => sum + (item.actualCost || 0), 0) || 0;
  const remaining = totalBudget - totalSpent;

  // Group budget items by category
  const budgetCategories = budgetItems ? 
    budgetItems.reduce((acc: any[], item: any) => {
      const existingCategory = acc.find(cat => cat.category === item.category);
      if (existingCategory) {
        existingCategory.estimated += item.estimatedCost || 0;
        existingCategory.actual += item.actualCost || 0;
      } else {
        acc.push({
          id: item.id,
          category: item.category,
          estimated: item.estimatedCost || 0,
          actual: item.actualCost || 0,
          percentage: totalBudget > 0 ? Math.round(((item.estimatedCost || 0) / totalBudget) * 100) : 0,
          status: (item.actualCost || 0) === 0 ? 'pending' : 
                  (item.actualCost || 0) > (item.estimatedCost || 0) ? 'over' : 'under'
        });
      }
      return acc;
    }, []) : [];

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

  if (projectsLoading || budgetLoading) {
    return (
      <div className="flex min-h-screen bg-cream">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <div className="p-6">
            <div className="text-center py-12">
              <LoadingSpinner size="lg" text="Loading your budget information..." />
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // Show empty state if no wedding project exists
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col lg:ml-64">
            <Header />
            <main className="flex-1 p-6">
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Wedding Project Found</h3>
                <p className="text-gray-600 mb-6">Complete your wedding intake form to start planning your budget.</p>
                <Button onClick={() => window.location.href = '/intake'} className="gradient-blush-rose text-white">
                  Complete Intake Form
                </Button>
              </div>
            </main>
          </div>
        </div>
        <MobileNav />
      </div>
    );
  }

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
                    value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} 
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
                    {totalBudget > 0 ? Math.round(((totalBudget - totalSpent) / totalBudget) * 100) : 0}% of budget
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
                {budgetCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Budget Items Yet</h3>
                    <p className="text-gray-500 mb-4">Your budget breakdown will appear here once you add expense categories.</p>
                    <Button className="gradient-blush-rose text-white">
                      <Plus size={16} className="mr-2" />
                      Add Your First Expense
                    </Button>
                  </div>
                ) : (
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
                            value={item.estimated > 0 ? (item.actual / item.estimated) * 100 : 0} 
                            className="mt-2"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}