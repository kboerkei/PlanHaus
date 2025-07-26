import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Mail, 
  FileSpreadsheet, 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign,
  Building,
  CheckCircle,
  Clock,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ExportDialogProps {
  projectId: string;
  projectName: string;
  trigger?: React.ReactNode;
}

interface ExportStats {
  summary: string;
  stats: {
    totalTasks: number;
    completedTasks: number;
    totalGuests: number;
    confirmedGuests: number;
    totalBudget: number;
    spentBudget: number;
    totalVendors: number;
    bookedVendors: number;
  };
  itemCounts: {
    tasks: number;
    guests: number;
    budgetItems: number;
    vendors: number;
    scheduleEvents: number;
    inspirationItems: number;
  };
}

export default function ExportDialog({ projectId, projectName, trigger }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [stats, setStats] = useState<ExportStats | null>(null);
  const { toast } = useToast();

  const loadExportPreview = async () => {
    if (stats) return; // Already loaded
    
    setIsLoading(true);
    try {
      const response = await apiRequest(`/api/export/preview/${projectId}`);
      setStats(response);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load export preview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogOpen = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      loadExportPreview();
    }
  };

  const downloadExcel = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/export/excel/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionId')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName.replace(/[^a-zA-Z0-9]/g, '_')}_wedding_export.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Export Downloaded",
        description: "Your wedding planning data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download export file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address to send the export.",
        variant: "destructive",
      });
      return;
    }

    setEmailLoading(true);
    try {
      await apiRequest('/api/export/email', {
        method: 'POST',
        body: JSON.stringify({
          projectId: parseInt(projectId),
          email: email.trim(),
        }),
      });

      toast({
        title: "Email Sent",
        description: `Export has been sent to ${email}`,
      });
      setEmail("");
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Email Failed",
        description: "Failed to send export email. Please check your email address and try again.",
        variant: "destructive",
      });
    } finally {
      setEmailLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getCompletionPercentage = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Export Wedding Planning Data
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading export preview...</span>
          </div>
        ) : stats ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="download">Download</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.stats.completedTasks}/{stats.stats.totalTasks}</div>
                    <div className="text-xs text-muted-foreground">
                      {getCompletionPercentage(stats.stats.completedTasks, stats.stats.totalTasks)}% complete
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      Guests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.stats.confirmedGuests}/{stats.stats.totalGuests}</div>
                    <div className="text-xs text-muted-foreground">
                      {getCompletionPercentage(stats.stats.confirmedGuests, stats.stats.totalGuests)}% confirmed
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-500" />
                      Budget
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(stats.stats.spentBudget)}</div>
                    <div className="text-xs text-muted-foreground">
                      of {formatCurrency(stats.stats.totalBudget)} ({getCompletionPercentage(stats.stats.spentBudget, stats.stats.totalBudget)}%)
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Building className="h-4 w-4 text-purple-500" />
                      Vendors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.stats.bookedVendors}/{stats.stats.totalVendors}</div>
                    <div className="text-xs text-muted-foreground">
                      {getCompletionPercentage(stats.stats.bookedVendors, stats.stats.totalVendors)}% booked
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Export Contents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <span>Tasks & Timeline</span>
                      <Badge variant="secondary">{stats.itemCounts.tasks}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Guest List</span>
                      <Badge variant="secondary">{stats.itemCounts.guests}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Budget Items</span>
                      <Badge variant="secondary">{stats.itemCounts.budgetItems}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Vendors</span>
                      <Badge variant="secondary">{stats.itemCounts.vendors}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Schedule Events</span>
                      <Badge variant="secondary">{stats.itemCounts.scheduleEvents}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Inspiration Items</span>
                      <Badge variant="secondary">{stats.itemCounts.inspirationItems}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="download" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Download your complete wedding planning data as an Excel spreadsheet. 
                    The file will include separate sheets for tasks, guests, budget, vendors, and schedule.
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Easy to share with vendors and family</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Works with Excel, Google Sheets, and other spreadsheet apps</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Includes all your current data and planning progress</span>
                  </div>

                  <Separator />

                  <Button 
                    onClick={downloadExcel} 
                    disabled={isLoading}
                    className="w-full gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                    Download Excel File
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Export
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Send your wedding planning export directly to your email. 
                    Perfect for sharing with your partner, family, or backup purposes.
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Secure delivery with professional formatting</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Excel attachment with all your wedding data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Usually arrives within a few minutes</span>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    onClick={sendEmail} 
                    disabled={emailLoading || !email.trim()}
                    className="w-full gap-2"
                  >
                    {emailLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Send Export Email
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}