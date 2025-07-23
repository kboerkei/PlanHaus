import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Heart, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { IntakeWizardData, StepProps } from "./types";

export default function Step1EventDetails({ onNext, onBack, isFirstStep, isLastStep }: StepProps) {
  const { control, watch, setValue } = useFormContext<IntakeWizardData>();
  const weddingDate = watch("eventDetails.weddingDate");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      {/* Couple Information */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center">
            <Heart className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">About You</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner 1 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Primary Partner</h4>
            
            <FormField
              control={control}
              name="eventDetails.partner1FirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="eventDetails.partner1LastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="eventDetails.partner1Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Partner 2 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700">Partner</h4>
            
            <FormField
              control={control}
              name="eventDetails.partner2FirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="eventDetails.partner2LastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="eventDetails.partner2Email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wedding Date */}
          <FormField
            control={control}
            name="eventDetails.weddingDate"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Wedding Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : "Pick your wedding date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ceremony Location */}
          <FormField
            control={control}
            name="eventDetails.ceremonyLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ceremony Location *</FormLabel>
                <FormControl>
                  <Input placeholder="City, State or venue name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Reception Location */}
          <FormField
            control={control}
            name="eventDetails.receptionLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reception Location</FormLabel>
                <FormControl>
                  <Input placeholder="Same as ceremony or different venue" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Guest Count */}
        <FormField
          control={control}
          name="eventDetails.estimatedGuests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Guest Count *</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <Input
                    type="number"
                    min="1"
                    placeholder="How many guests will attend?"
                    value={field.value || ""}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
}