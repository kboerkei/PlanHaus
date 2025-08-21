import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { 
  Plus, 
  Users, 
  Edit3, 
  Trash2, 
  Download, 
  FileText, 
  UserPlus,
  UserMinus,
  Move,
  Armchair
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Types for seating chart data
interface SeatingTable {
  id: number;
  name: string;
  maxSeats: number;
  notes?: string;
  position?: { x: number; y: number };
  createdAt: string;
  updatedAt: string;
}

interface Guest {
  id: number;
  name: string;
  email?: string;
}

interface SeatingAssignment {
  id: number;
  tableId: number;
  guestId: number;
  seatNumber?: number;
  guest: Guest;
}

interface SeatingChartData {
  tables: SeatingTable[];
  assignments: SeatingAssignment[];
  unassignedGuests: Guest[];
}

// Table Form Component
function TableFormDialog({ table, onClose }: { table?: SeatingTable; onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: table?.name || "",
    maxSeats: table?.maxSeats || 8,
    notes: table?.notes || "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createTableMutation = useMutation({
    mutationFn: (data: { name: string; maxSeats: number; notes?: string }) =>
      apiRequest("/api/seating-chart/tables", { 
        method: "POST", 
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seating-chart"] });
      toast({ title: "Table created successfully!" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to create table", variant: "destructive" });
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: (data: { name: string; maxSeats: number; notes?: string }) =>
      apiRequest(`/api/seating-chart/tables/${table?.id}`, { method: "PUT", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seating-chart"] });
      toast({ title: "Table updated successfully!" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to update table", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (table) {
      updateTableMutation.mutate(formData);
    } else {
      createTableMutation.mutate(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tableName">Table Name</Label>
        <Input
          id="tableName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Head Table, Family Table, Table 1"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="maxSeats">Maximum Seats</Label>
        <Select value={formData.maxSeats.toString()} onValueChange={(value) => setFormData({ ...formData, maxSeats: parseInt(value) })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 2).map((num) => (
              <SelectItem key={num} value={num.toString()}>{num} seats</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Special arrangements, dietary needs, etc."
          rows={3}
        />
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={createTableMutation.isPending || updateTableMutation.isPending}>
          {table ? "Update Table" : "Create Table"}
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Guest Assignment Component
function GuestAssignmentDialog({ 
  table, 
  unassignedGuests, 
  onClose 
}: { 
  table: SeatingTable; 
  unassignedGuests: Guest[]; 
  onClose: () => void;
}) {
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const assignGuestMutation = useMutation({
    mutationFn: (data: { tableId: number; guestId: number }) =>
      apiRequest("/api/seating-chart/assignments", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seating-chart"] });
      toast({ title: "Guest assigned successfully!" });
      onClose();
    },
    onError: () => {
      toast({ title: "Failed to assign guest", variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGuestId) {
      assignGuestMutation.mutate({
        tableId: table.id,
        guestId: parseInt(selectedGuestId),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="guest">Select Guest</Label>
        <Select value={selectedGuestId} onValueChange={setSelectedGuestId}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a guest to assign..." />
          </SelectTrigger>
          <SelectContent>
            {unassignedGuests.map((guest) => (
              <SelectItem key={guest.id} value={guest.id.toString()}>
                {guest.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={!selectedGuestId || assignGuestMutation.isPending}>
          Assign Guest
        </Button>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Draggable Guest Component
function DraggableGuest({ guest, assignment }: { guest: Guest; assignment?: SeatingAssignment }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `guest-${guest.id}`,
    data: { guest, assignment }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-3 p-3 bg-gradient-to-r from-blush/20 to-rose-gold/20 rounded-xl border border-blush/30 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-50 scale-105' : ''
      } hover:shadow-md transition-all duration-200`}
    >
      <div className="p-1.5 bg-gradient-to-br from-blush to-rose-gold rounded-lg">
        <Users className="h-3 w-3 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-900">{guest.name}</span>
      <Move className="h-3 w-3 text-gray-400 ml-auto" />
    </div>
  );
}

// Droppable Table Component
function DroppableTable({ 
  table, 
  assignments, 
  onEditTable, 
  onDeleteTable,
  onRemoveGuest,
  unassignedGuests 
}: {
  table: SeatingTable;
  assignments: SeatingAssignment[];
  onEditTable: () => void;
  onDeleteTable: () => void;
  onRemoveGuest: (assignmentId: number) => void;
  unassignedGuests: Guest[];
}) {
  const assignedGuests = assignments.filter(a => a.tableId === table.id);
  const availableSeats = table.maxSeats - assignedGuests.length;

  const { setNodeRef, isOver } = useDroppable({
    id: `table-${table.id}`,
    data: { table }
  });

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      <Card className={`h-full hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-gray-200 rounded-2xl shadow-md hover:scale-[1.02] transform ${
        isOver ? 'ring-2 ring-blush ring-opacity-50 bg-blush/5' : ''
      }`}>
        <CardHeader className="pb-4 bg-gradient-to-r from-blush/10 to-rose-gold/10 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 bg-gradient-to-br from-blush to-rose-gold rounded-xl shadow-sm">
                <Armchair className="h-5 w-5 text-white" />
              </div>
              <span className="font-serif font-bold text-gray-900">{table.name}</span>
            </CardTitle>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEditTable}
                className="h-9 w-9 p-0 text-gray-500 hover:text-blush hover:bg-blush/10 rounded-xl transition-colors"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeleteTable}
                className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span className="font-medium">{assignedGuests.length} of {table.maxSeats}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              availableSeats === 0 
                ? 'bg-gray-100 text-gray-600' 
                : 'bg-green-100 text-green-700'
            }`}>
              {availableSeats === 0 ? 'Full' : `${availableSeats} available`}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3 group">
          {/* Assigned Guests */}
          <AnimatePresence>
            {assignedGuests.map((assignment) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative"
              >
                <DraggableGuest guest={assignment.guest} assignment={assignment} />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveGuest(assignment.id)}
                  className="absolute top-2 right-2 h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <UserMinus className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty Seats */}
          {Array.from({ length: availableSeats }, (_, i) => (
            <div key={i} className={`p-2 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm transition-all duration-200 ${
              isOver ? 'border-blush bg-blush/5' : ''
            }`}>
              {isOver ? 'Drop guest here' : 'Empty seat'}
            </div>
          ))}
          
          {/* Drag and Drop Instructions */}
          {availableSeats > 0 && unassignedGuests.length > 0 && (
            <div className="text-center py-2 text-xs text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
              Drag guests here to assign them
            </div>
          )}
          
          {table.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500">{table.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main Seating Chart Component
export default function SeatingChart() {
  const [showTableForm, setShowTableForm] = useState(false);
  const [editingTable, setEditingTable] = useState<SeatingTable | null>(null);
  const [showGuestAssignment, setShowGuestAssignment] = useState<SeatingTable | null>(null);
  const [activeDragItem, setActiveDragItem] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Fetch seating chart data
  const { data: seatingData, isLoading } = useQuery<SeatingChartData>({
    queryKey: ["/api/seating-chart"],
  });

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: (tableId: number) =>
      apiRequest(`/api/seating-chart/tables/${tableId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seating-chart"] });
      toast({ title: "Table deleted successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to delete table", variant: "destructive" });
    },
  });

  // Remove guest assignment mutation
  const removeGuestMutation = useMutation({
    mutationFn: (assignmentId: number) =>
      apiRequest(`/api/seating-chart/assignments/${assignmentId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seating-chart"] });
      toast({ title: "Guest removed from table!" });
    },
    onError: () => {
      toast({ title: "Failed to remove guest", variant: "destructive" });
    },
  });

  // Assign guest mutation
  const assignGuestMutation = useMutation({
    mutationFn: ({ tableId, guestId }: { tableId: number; guestId: number }) =>
      apiRequest("/api/seating-chart/assignments", { 
        method: "POST", 
        body: JSON.stringify({ tableId, guestId }),
        headers: { "Content-Type": "application/json" }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seating-chart"] });
      toast({ title: "Guest assigned successfully!" });
    },
    onError: () => {
      toast({ title: "Failed to assign guest", variant: "destructive" });
    },
  });

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragItem(event.active.data.current);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragItem(null);

    if (!over) return;

    const draggedGuest = active.data.current?.guest;
    const draggedAssignment = active.data.current?.assignment;
    const targetTable = over.data.current?.table;

    if (!draggedGuest || !targetTable) return;

    // Check if table has available seats
    const currentAssignments = seatingData?.assignments.filter(a => a.tableId === targetTable.id) || [];
    if (currentAssignments.length >= targetTable.maxSeats) {
      toast({ title: "Table is full", description: "Cannot assign more guests to this table.", variant: "destructive" });
      return;
    }

    // If guest is already assigned to a table, remove them first
    if (draggedAssignment) {
      // Guest is moving between tables
      assignGuestMutation.mutate({
        tableId: targetTable.id,
        guestId: draggedGuest.id
      });
    } else {
      // Guest is being assigned for the first time
      assignGuestMutation.mutate({
        tableId: targetTable.id,
        guestId: draggedGuest.id
      });
    }
  };

  // PDF Export functionality
  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/export/seating-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProject?.id,
          seatingData: {
            tables: tables,
            guests: guests,
            layout: layout
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `seating-chart-${currentProject?.name || 'wedding'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: "Seating chart PDF has been downloaded.",
        });
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (!seatingData) return;
    
    const csvData = seatingData.tables.map(table => {
      const guests = seatingData.assignments
        .filter(a => a.tableId === table.id)
        .map(a => a.guest.name)
        .join("; ");
      
      return {
        "Table Name": table.name,
        "Max Seats": table.maxSeats,
        "Assigned Guests": guests,
        "Available Seats": table.maxSeats - seatingData.assignments.filter(a => a.tableId === table.id).length,
        "Notes": table.notes || ""
      };
    });

    const csvContent = [
      Object.keys(csvData[0] || {}).join(","),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "seating-chart.csv";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "CSV exported successfully!" });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Seating Chart</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const tables = seatingData?.tables || [];
  const assignments = seatingData?.assignments || [];
  const unassignedGuests = seatingData?.unassignedGuests || [];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header with PlanHaus styling */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">Seating Chart</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">Organize your guests into tables for the perfect wedding layout</p>
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mt-6">
          <Button variant="outline" onClick={exportToCSV} className="rounded-full">
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF} className="rounded-full">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={showTableForm} onOpenChange={setShowTableForm}>
            <DialogTrigger asChild>
              <Button className="rounded-full bg-gradient-to-r from-blush to-rose-gold hover:from-rose-400 hover:to-pink-600 shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Table</DialogTitle>
              </DialogHeader>
              <TableFormDialog onClose={() => setShowTableForm(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold gradient-text bg-gradient-to-r from-rose-600 to-pink-600">
              {tables.length}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1">Tables</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold gradient-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {assignments.length}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1">Assigned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold gradient-text bg-gradient-to-r from-amber-600 to-orange-600">
              {unassignedGuests.length}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1">Unassigned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold gradient-text bg-gradient-to-r from-emerald-600 to-green-600">
              {tables.reduce((total, table) => total + table.maxSeats, 0)}
            </div>
            <div className="text-sm font-medium text-gray-600 mt-1">Total Seats</div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Guests with Enhanced Styling */}
      {unassignedGuests.length > 0 && (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 rounded-2xl shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-amber-800">
              <div className="p-2 bg-amber-200 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
              Unassigned Guests ({unassignedGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {unassignedGuests.map((guest) => (
                <motion.div
                  key={guest.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <DraggableGuest guest={guest} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Grid with Enhanced Empty State */}
      {tables.length === 0 ? (
        <Card className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 rounded-2xl shadow-lg">
          <CardContent>
            <div className="bg-gradient-to-br from-blush to-rose-gold p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Armchair className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">No tables created yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-lg">
              Start by creating your first table to organize your wedding seating arrangement
            </p>
            <Button 
              onClick={() => setShowTableForm(true)}
              className="bg-gradient-to-r from-blush to-rose-gold hover:from-rose-400 hover:to-pink-600 shadow-lg rounded-full px-8 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Your First Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {tables.map((table) => (
              <DroppableTable
                key={table.id}
                table={table}
                assignments={assignments}
                onEditTable={() => setEditingTable(table)}
                onDeleteTable={() => deleteTableMutation.mutate(table.id)}
                onRemoveGuest={(assignmentId) => removeGuestMutation.mutate(assignmentId)}
                unassignedGuests={unassignedGuests}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Table Dialog */}
      <Dialog open={!!editingTable} onOpenChange={() => setEditingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
          </DialogHeader>
          {editingTable && (
            <TableFormDialog 
              table={editingTable} 
              onClose={() => setEditingTable(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Guest Assignment Dialog */}
      <Dialog open={!!showGuestAssignment} onOpenChange={() => setShowGuestAssignment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Guest to {showGuestAssignment?.name}
            </DialogTitle>
          </DialogHeader>
          {showGuestAssignment && (
            <GuestAssignmentDialog
              table={showGuestAssignment}
              unassignedGuests={unassignedGuests}
              onClose={() => setShowGuestAssignment(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeDragItem ? (
          <div className="bg-white shadow-lg rounded-xl border border-blush p-3 rotate-6 scale-110">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-gradient-to-br from-blush to-rose-gold rounded-lg">
                <Users className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {activeDragItem.guest?.name}
              </span>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </div>
  </DndContext>
  );
}