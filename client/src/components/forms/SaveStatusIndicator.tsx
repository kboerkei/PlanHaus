import React from "react";

interface SaveStatusIndicatorProps {
  isSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
}

export function SaveStatusIndicator({ 
  isSaving = false,
  lastSaved = null,
  hasUnsavedChanges = false 
}: SaveStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isSaving ? (
        <>
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
          Saving...
        </>
      ) : hasUnsavedChanges ? (
        <>
          <div className="h-2 w-2 bg-orange-500 rounded-full" />
          Unsaved changes
        </>
      ) : lastSaved ? (
        <>
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          Saved {lastSaved.toLocaleTimeString()}
        </>
      ) : null}
    </div>
  );
}