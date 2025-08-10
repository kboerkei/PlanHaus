import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, DollarSign, Target, CreditCard } from 'lucide-react';
import * as accounting from 'accounting-js';
import type { BudgetItem, BudgetChartData } from '@/types';

interface BudgetChartsProps {
  budgetItems: BudgetItem[];
}

const COLORS = [
  '#f43f5e', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#84cc16', '#6366f1', '#14b8a6', '#f97316', '#a855f7'
];

const CATEGORY_COLORS: { [key: string]: string } = {
  'Venue': '#f43f5e',
  'Catering': '#ec4899',
  'Photography': '#8b5cf6',
  'Flowers': '#06b6d4',
  'Music': '#10b981',
  'Transportation': '#f59e0b',
  'Attire': '#ef4444',
  'Rings': '#84cc16',
  'Invitations': '#6366f1',
  'Decorations': '#14b8a6',
  'Beauty': '#f97316',
  'Favors': '#a855f7',
  'Other': '#6b7280'
};

export default function BudgetCharts({ budgetItems }: BudgetChartsProps) {
  // Calculate category totals with proper number parsing
  const categoryData = React.useMemo(() => {
    const categories: { [key: string]: { estimated: number; actual: number; count: number } } = {};
    
    budgetItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = { estimated: 0, actual: 0, count: 0 };
      }
      const estimated = parseFloat(String(item.estimatedCost)) || 0;
      const actual = parseFloat(String(item.actualCost)) || 0;
      
      categories[item.category].estimated += estimated;
      categories[item.category].actual += actual;
      categories[item.category].count += 1;
    });

    return Object.entries(categories).map(([category, data]) => ({
      category,
      estimated: data.estimated,
      actual: data.actual,
      count: data.count,
      variance: data.actual - data.estimated,
      color: CATEGORY_COLORS[category] || '#6b7280'
    }));
  }, [budgetItems]);

  // Calculate payment status data with proper number parsing  
  const paymentData = React.useMemo(() => {
    const status = { pending: 0, paid: 0, overdue: 0 };
    budgetItems.forEach(item => {
      const actualCost = parseFloat(String(item.actualCost)) || 0;
      const estimatedCost = parseFloat(String(item.estimatedCost)) || 0;
      const paymentStatus = item.isPaid ? 'paid' : 'pending'; // Use isPaid field from our schema
      
      status[paymentStatus] += actualCost || estimatedCost;
    });
    
    return [
      { name: 'Paid', value: status.paid, color: '#10b981' },
      { name: 'Pending', value: status.pending, color: '#f59e0b' },
      { name: 'Overdue', value: status.overdue, color: '#ef4444' }
    ].filter(item => item.value > 0);
  }, [budgetItems]);

  // Calculate monthly spending trend (mock data for demo)
  const monthlySpending = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => ({
      month,
      spending: Math.random() * 5000 + 1000, // Mock data
      budget: 4000 + (index * 500)
    }));
  }, []);

  // Calculate totals with proper number parsing
  const totalEstimated = budgetItems.reduce((sum, item) => sum + (parseFloat(String(item.estimatedCost)) || 0), 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (parseFloat(String(item.actualCost)) || 0), 0);
  const totalVariance = totalActual - totalEstimated;
  const budgetUsage = totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0;

  // Get top spending categories
  const topCategories = categoryData
    .sort((a, b) => b.actual - a.actual)
    .slice(0, 5);

  // Budget alerts
  const alerts = React.useMemo(() => {
    const alerts: { type: 'warning' | 'error' | 'info'; message: string }[] = [];
    
    if (budgetUsage > 90) {
      alerts.push({ type: 'error', message: 'Budget usage is over 90%! Consider reviewing expenses.' });
    } else if (budgetUsage > 80) {
      alerts.push({ type: 'warning', message: 'Budget usage is over 80%. Monitor spending closely.' });
    }
    
    const unpaidItems = budgetItems.filter(item => !item.isPaid && (parseFloat(String(item.actualCost)) || 0) > 0);
    if (unpaidItems.length > 0) {
      alerts.push({ type: 'error', message: `${unpaidItems.length} payment${unpaidItems.length > 1 ? 's' : ''} pending.` });
    }
    
    return alerts;
  }, [budgetUsage, budgetItems]);

  const formatCurrency = (amount: number) => accounting.formatMoney(amount || 0, { symbol: '$', precision: 2 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="lg:col-span-2">
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <Alert key={index} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Budget Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalEstimated)}</div>
              <div className="text-sm text-gray-600">Total Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalActual)}</div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${totalVariance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(Math.abs(totalVariance))}
              </div>
              <div className="text-sm text-gray-600">
                {totalVariance > 0 ? 'Over Budget' : 'Under Budget'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{budgetUsage.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Budget Used</div>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Budget Usage</span>
              <span>{budgetUsage.toFixed(1)}%</span>
            </div>
            <Progress value={budgetUsage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Spending by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryData.filter(item => item.actual > 0)}
                cx="50%"
                cy="45%"
                labelLine={true}
                label={({ category, actual, percent }) => 
                  percent > 8 ? `${category}: ${formatCurrency(actual)}` : ''
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="actual"
              >
                {categoryData.filter(item => item.actual > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                formatter={(value, entry) => {
                  const payload = entry?.payload as any;
                  return payload?.category ? `${payload.category}: ${formatCurrency(payload.actual)}` : String(value);
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span>Payment Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={paymentData}
                cx="50%"
                cy="45%"
                labelLine={true}
                label={({ name, value, percent }) => 
                  percent > 10 ? `${name}: ${formatCurrency(value)}` : ''
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend 
                verticalAlign="bottom" 
                height={50}
                formatter={(value, entry) => {
                  const payload = entry?.payload as any;
                  return payload?.name ? `${payload.name}: ${formatCurrency(payload.value)}` : String(value);
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Budget vs Actual by Category */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            <span>Budget vs Actual by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Bar dataKey="estimated" fill="#8b5cf6" name="Estimated" />
              <Bar dataKey="actual" fill="#06b6d4" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Spending Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-orange-600" />
            <span>Top Spending Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-lg font-semibold text-gray-700">#{index + 1}</div>
                  <div>
                    <div className="font-medium">{category.category}</div>
                    <div className="text-sm text-gray-600">{category.count} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(category.actual)}</div>
                  <Badge variant={category.variance > 0 ? 'destructive' : 'default'} className="text-xs">
                    {category.variance > 0 ? '+' : ''}{formatCurrency(category.variance)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Spending Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="spending" stroke="#8b5cf6" name="Actual Spending" strokeWidth={2} />
              <Line type="monotone" dataKey="budget" stroke="#06b6d4" name="Budget" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}