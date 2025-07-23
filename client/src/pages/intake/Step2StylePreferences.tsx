import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Palette, Plus, Trash2, Link } from "lucide-react";
import { motion } from "framer-motion";
import type { IntakeWizardData, StepProps } from "./types";
import { weddingVibes } from "./types";

export default function Step2StylePreferences({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  const { control, watch, setValue } = useFormContext<IntakeWizardData>();
  const [newElement, setNewElement] = useState("");
  const [newBoard, setNewBoard] = useState("");
  
  const mustHaveElements = watch("stylePreferences.mustHaveElements") || [];
  const pinterestBoards = watch("stylePreferences.pinterestBoards") || [];

  const addMustHaveElement = () => {
    if (newElement.trim()) {
      setValue("stylePreferences.mustHaveElements", [...mustHaveElements, newElement.trim()]);
      setNewElement("");
    }
  };

  const removeMustHaveElement = (index: number) => {
    setValue("stylePreferences.mustHaveElements", mustHaveElements.filter((_, i) => i !== index));
  };

  const addPinterestBoard = () => {
    if (newBoard.trim()) {
      setValue("stylePreferences.pinterestBoards", [...pinterestBoards, newBoard.trim()]);
      setNewBoard("");
    }
  };

  const removePinterestBoard = (index: number) => {
    setValue("stylePreferences.pinterestBoards", pinterestBoards.filter((_, i) => i !== index));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Overall Vibe */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
            <Palette className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Wedding Style</h3>
        </div>

        <FormField
          control={control}
          name="stylePreferences.overallVibe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Wedding Vibe *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your wedding style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {weddingVibes.map(vibe => (
                    <SelectItem key={vibe} value={vibe}>{vibe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="stylePreferences.colorPalette"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Palette</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your wedding colors (e.g., blush pink, sage green, gold accents)"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Must-Have Elements */}
      <div className="space-y-4">
        <Label>Must-Have Wedding Elements</Label>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={newElement}
              onChange={(e) => setNewElement(e.target.value)}
              placeholder="Add a must-have element (e.g., live band, photo booth)"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMustHaveElement())}
            />
            <Button type="button" onClick={addMustHaveElement} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {mustHaveElements.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {mustHaveElements.map((element, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {element}
                  <button 
                    type="button"
                    onClick={() => removeMustHaveElement(index)}
                    className="ml-1 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pinterest Boards */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Link className="h-4 w-4 text-gray-500" />
          <Label>Pinterest Inspiration Boards</Label>
        </div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="url"
              value={newBoard}
              onChange={(e) => setNewBoard(e.target.value)}
              placeholder="Add Pinterest board URL"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPinterestBoard())}
            />
            <Button type="button" onClick={addPinterestBoard} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {pinterestBoards.length > 0 && (
            <div className="space-y-2">
              {pinterestBoards.map((board, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <a 
                    href={board} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline text-sm truncate flex-1 mr-2"
                  >
                    {board}
                  </a>
                  <button 
                    type="button"
                    onClick={() => removePinterestBoard(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Share your inspiration boards to help us understand your style preferences
        </p>
      </div>
    </motion.div>
  );
}