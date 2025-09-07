import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  WeddingHeading, 
  WeddingText, 
  WeddingContainer, 
  WeddingGrid, 
  WeddingCard,
  WeddingBadge,
  WeddingSpacer
} from '@/components/ui/phase2-typography';
import { 
  WeddingSkeletonCard, 
  DashboardSkeleton, 
  WeddingSpinner 
} from '@/components/ui/phase2-skeleton-loaders';
import { 
  InteractiveButton, 
  FloatingActionButton, 
  AnimatedProgress,
  AnimatedCard,
  WeddingCelebration
} from '@/components/ui/phase2-micro-interactions';
import { 
  ValidatedFormField, 
  useFormValidation,
  FormValidationSummary,
  AutoSaveIndicator
} from '@/components/ui/phase2-form-validation';

// Enhanced Dashboard for Phase 2
export const Phase2EnhancedDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date>();

  // Form validation for quick add task
  const taskValidation = {
    title: (value: string) => {
      if (!value) return 'Task title is required';
      if (value.length < 3) return 'Task title must be at least 3 characters';
      return null;
    },
    description: (value: string) => {
      if (value && value.length > 500) return 'Description must be less than 500 characters';
      return null;
    }
  };

  const taskForm = useFormValidation(
    { title: '', description: '' },
    taskValidation
  );

  // Simulate loading
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  // Simulate saving
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
    }, 1500);
  };

  // Simulate task completion celebration
  const handleTaskComplete = () => {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-blush-50 p-6">
        <WeddingContainer>
          <DashboardSkeleton />
        </WeddingContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush-50">
      {/* Celebration overlay */}
      <WeddingCelebration
        isVisible={showCelebration}
        type="success"
        message="Task completed! 🎉"
        onComplete={() => setShowCelebration(false)}
      />

      <WeddingContainer>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="py-8"
        >
          <WeddingHeading level={1} animate>
            Welcome to Your Wedding Planning Dashboard
          </WeddingHeading>
          <WeddingText variant="lead" className="mt-4">
            Track your progress, manage tasks, and stay organized for your special day
          </WeddingText>
        </motion.div>

        {/* Quick Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <WeddingGrid cols={3} gap="default">
            <AnimatedCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blush-100 rounded-lg mx-auto mb-4">
                <span className="text-2xl">💍</span>
              </div>
              <WeddingHeading level={3} className="text-blush-600">
                45 Days
              </WeddingHeading>
              <WeddingText variant="small">Until Your Wedding</WeddingText>
            </AnimatedCard>

            <AnimatedCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <WeddingHeading level={3} className="text-green-600">
                23/45
              </WeddingHeading>
              <WeddingText variant="small">Tasks Completed</WeddingText>
            </AnimatedCard>

            <AnimatedCard className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded-lg mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <WeddingHeading level={3} className="text-amber-600">
                $12,450
              </WeddingHeading>
              <WeddingText variant="small">Budget Remaining</WeddingText>
            </AnimatedCard>
          </WeddingGrid>
        </motion.div>

        {/* Main Content Grid */}
        <WeddingGrid cols={2} gap="loose">
          {/* Progress Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <WeddingCard>
              <WeddingHeading level={3} className="mb-6">
                Planning Progress
              </WeddingHeading>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <WeddingText variant="small">Overall Progress</WeddingText>
                    <WeddingText variant="small">51%</WeddingText>
                  </div>
                  <AnimatedProgress value={51} variant="default" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <WeddingText variant="small">Vendor Bookings</WeddingText>
                    <WeddingText variant="small">80%</WeddingText>
                  </div>
                  <AnimatedProgress value={80} variant="success" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <WeddingText variant="small">Guest Management</WeddingText>
                    <WeddingText variant="small">35%</WeddingText>
                  </div>
                  <AnimatedProgress value={35} variant="warning" />
                </div>
              </div>
            </WeddingCard>
          </motion.div>

          {/* Quick Add Task */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <WeddingCard>
              <WeddingHeading level={3} className="mb-6">
                Quick Add Task
              </WeddingHeading>

              <form className="space-y-4">
                <ValidatedFormField
                  label="Task Title"
                  name="title"
                  value={taskForm.values.title}
                  onChange={(value) => taskForm.setValue('title', value)}
                  onBlur={() => taskForm.setTouchedField('title')}
                  error={taskForm.errors.title}
                  touched={taskForm.touched.title}
                  required
                  placeholder="Enter task title..."
                />

                <ValidatedFormField
                  label="Description"
                  name="description"
                  type="textarea"
                  value={taskForm.values.description}
                  onChange={(value) => taskForm.setValue('description', value)}
                  onBlur={() => taskForm.setTouchedField('description')}
                  error={taskForm.errors.description}
                  touched={taskForm.touched.description}
                  placeholder="Optional description..."
                />

                <FormValidationSummary
                  errors={taskForm.errors}
                  touched={taskForm.touched}
                />

                <div className="flex space-x-3">
                  <InteractiveButton
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={!taskForm.isValid}
                    variant="primary"
                  >
                    Add Task
                  </InteractiveButton>
                  
                  <InteractiveButton
                    onClick={taskForm.reset}
                    variant="secondary"
                  >
                    Clear
                  </InteractiveButton>
                </div>
              </form>

              <WeddingSpacer size="sm" />
              
              <AutoSaveIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
              />
            </WeddingCard>
          </motion.div>
        </WeddingGrid>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <WeddingCard>
            <WeddingHeading level={3} className="mb-6">
              Recent Activity
            </WeddingHeading>

            <div className="space-y-4">
              {[
                { action: 'Task completed', item: 'Book photographer', time: '2 hours ago', type: 'success' },
                { action: 'Budget updated', item: 'Venue deposit paid', time: '4 hours ago', type: 'info' },
                { action: 'Guest added', item: 'Sarah Martinez', time: '1 day ago', type: 'default' },
                { action: 'Vendor contacted', item: 'Florist - Bloom & Blossom', time: '2 days ago', type: 'warning' }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <WeddingBadge variant={activity.type as any} size="sm">
                      {activity.action}
                    </WeddingBadge>
                    <WeddingText variant="small">{activity.item}</WeddingText>
                  </div>
                  <WeddingText variant="caption">{activity.time}</WeddingText>
                </motion.div>
              ))}
            </div>
          </WeddingCard>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 flex justify-center space-x-4"
        >
          <InteractiveButton
            onClick={handleRefresh}
            variant="secondary"
            size="lg"
          >
            Refresh Dashboard
          </InteractiveButton>
          
          <InteractiveButton
            onClick={handleTaskComplete}
            variant="success"
            size="lg"
          >
            Complete Sample Task
          </InteractiveButton>
        </motion.div>
      </WeddingContainer>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => console.log('Quick action')}
        icon={<span className="text-xl">+</span>}
        label="Quick Add"
        position="bottom-right"
      />
    </div>
  );
};

export default Phase2EnhancedDashboard; 