import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { DollarSign, ListChecks, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { IntakeWizardData, StepProps } from "./types";
import { priorityOptions } from "./types";

export default function Step3BudgetEstimate({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  const { control, watch, setValue } = useFormContext<IntakeWizardData>();
  const topPriorities = watch("budgetEstimate.topPriorities") || [];
  const totalBudget = watch("budgetEstimate.totalBudget");

  const togglePriority = (priority: string) => {
    const current = topPriorities;
    if (current.includes(priority)) {
      setValue("budgetEstimate.topPriorities", current.filter(p => p !== priority));
    } else if (current.length < 3) {
      setValue("budgetEstimate.topPriorities", [...current, priority]);
    }
  };

  // Generate AI budget suggestions based on total budget
  const getBudgetGuidance = () => {
    if (!totalBudget || totalBudget < 1000) return null;
    
    if (totalBudget < 15000) {
      return {
        type: "modest",
        message: "Focus on your top 3 priorities. Consider DIY elements for decoration and favors.",
        breakdown: "Venue & Catering: 50%, Photography: 15%, Attire: 10%, Other: 25%"
      };
    } else if (totalBudget < 30000) {
      return {
        type: "moderate", 
        message: "You have good flexibility. Consider hiring key vendors for your priorities.",
        breakdown: "Venue & Catering: 45%, Photography: 12%, Music: 8%, Flowers: 8%, Other: 27%"
      };
    } else {
      return {
        type: "flexible",
        message: "Great budget flexibility! You can invest in premium vendors and unique touches.",
        breakdown: "Venue & Catering: 40%, Photography: 15%, Entertainment: 10%, Flowers: 8%, Other: 27%"
      };
    }
  };

  const budgetGuidance = getBudgetGuidance();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Budget Input */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Planning</h3>
        </div>

        <FormField
          control={control}
          name="budgetEstimate.totalBudget"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Wedding Budget *</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="1000"
                    step="500"
                    placeholder="Enter your total budget"
                    className="pl-9"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Budget Guidance */}
        {budgetGuidance && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Budget Guidance</h4>
                <p className="text-blue-800 text-sm mb-2">{budgetGuidance.message}</p>
                <p className="text-blue-700 text-xs">
                  <strong>Suggested breakdown:</strong> {budgetGuidance.breakdown}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Priorities */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
            <ListChecks className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wedding Priorities</h3>
        </div>

        <div>
          <Label className="text-base font-medium">Top 3 Wedding Priorities</Label>
          <p className="text-sm text-gray-600 mb-4">
            Select the 3 most important aspects of your wedding day
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {priorityOptions.map(priority => (
              <label 
                key={priority} 
                className="flex items-center space-x-3 cursor-pointer group p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  checked={topPriorities.includes(priority)}
                  onCheckedChange={() => togglePriority(priority)}
                  disabled={!topPriorities.includes(priority) && topPriorities.length >= 3}
                />
                <span className="text-sm font-medium group-hover:text-gray-900 transition-colors">
                  {priority}
                </span>
              </label>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mt-3">
            Selected: {topPriorities.length}/3
          </p>
        </div>

        <FormField
          control={control}
          name="budgetEstimate.nonNegotiables"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Non-Negotiables</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Things that are absolutely essential for your wedding day (e.g., live music, specific photographer, certain venue style)"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Summary */}
      {(totalBudget > 0 || topPriorities.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-lg"
        >
          <h4 className="font-medium text-gray-900 mb-2">Your Planning Summary</h4>
          <div className="space-y-1 text-sm text-gray-700">
            {totalBudget > 0 && (
              <p>💰 Budget: ${totalBudget.toLocaleString()}</p>
            )}
            {topPriorities.length > 0 && (
              <p>🎯 Priorities: {topPriorities.join(", ")}</p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}