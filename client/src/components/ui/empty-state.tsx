import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { useToast } from '../../hooks/use-toast';
import { Upload, Sparkles, FileText, Users, Calendar, DollarSign } from 'lucide-react';

interface EmptyStateProps {
  type: 'guests' | 'tasks' | 'budget' | 'vendors' | 'timeline';
  context?: string;
  onImportSuccess?: () => void;
  onRecommendationsSuccess?: () => void;
}

export function EmptyState({ 
  type, 
  context = '', 
  onImportSuccess, 
  onRecommendationsSuccess 
}: EmptyStateProps) {
  const { toast } = useToast();

  const getContent = () => {
    switch (type) {
      case 'guests':
        return {
          title: 'No guests added yet',
          description: 'Start building your guest list to track RSVPs and manage seating.',
          icon: Users,
          primaryAction: 'Add Guest',
          secondaryAction: 'Import Guest List',
          tertiaryAction: 'Get AI Suggestions'
        };
      case 'tasks':
        return {
          title: 'No tasks created yet',
          description: 'Create your wedding planning checklist to stay organized.',
          icon: Calendar,
          primaryAction: 'Add Task',
          secondaryAction: 'Import Tasks',
          tertiaryAction: 'Get AI Suggestions'
        };
      case 'budget':
        return {
          title: 'No budget items yet',
          description: 'Start tracking your wedding expenses and stay within budget.',
          icon: DollarSign,
          primaryAction: 'Add Budget Item',
          secondaryAction: 'Import Budget',
          tertiaryAction: 'Get AI Suggestions'
        };
      case 'vendors':
        return {
          title: 'No vendors added yet',
          description: 'Keep track of your vendors, quotes, and important details.',
          icon: FileText,
          primaryAction: 'Add Vendor',
          secondaryAction: 'Import Vendors',
          tertiaryAction: 'Get AI Suggestions'
        };
      case 'timeline':
        return {
          title: 'No timeline events yet',
          description: 'Create your wedding day timeline to ensure everything runs smoothly.',
          icon: Calendar,
          primaryAction: 'Add Event',
          secondaryAction: 'Import Timeline',
          tertiaryAction: 'Get AI Suggestions'
        };
      default:
        return {
          title: 'No items yet',
          description: 'Get started by adding your first item.',
          icon: FileText,
          primaryAction: 'Add Item',
          secondaryAction: 'Import Data',
          tertiaryAction: 'Get AI Suggestions'
        };
    }
  };

  const content = getContent();

  const handleImport = async () => {
    try {
      // Simulate file import
      toast({
        title: "Import started",
        description: `Importing ${type} data...`,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Import successful",
        description: `Successfully imported ${type} data!`,
      });
      
      onImportSuccess?.();
    } catch (error) {
      toast({
        title: "Import failed",
        description: "There was an error importing your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRecommendations = async () => {
    try {
      toast({
        title: "Generating suggestions",
        description: `Getting AI recommendations for ${type}...`,
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Suggestions ready",
        description: `AI has generated ${type} suggestions for you!`,
      });
      
      onRecommendationsSuccess?.();
    } catch (error) {
      toast({
        title: "Failed to generate suggestions",
        description: "There was an error generating AI suggestions. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <content.icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <CardTitle className="text-lg">{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full" onClick={() => {}}>
          {content.primaryAction}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleImport}>
          <Upload className="w-4 h-4 mr-2" />
          {content.secondaryAction}
        </Button>
        <Button variant="ghost" className="w-full" onClick={handleRecommendations}>
          <Sparkles className="w-4 h-4 mr-2" />
          {content.tertiaryAction}
        </Button>
      </CardContent>
    </Card>
  );
}