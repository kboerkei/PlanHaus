import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
      apiRequest("/api/seating-chart/tables", { method: "POST", body: JSON.stringify(data) }),
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

// Table Card Component
function TableCard({ 
  table, 
  assignments, 
  onEditTable, 
  onDeleteTable, 
  onAssignGuest, 
  onRemoveGuest 
}: {
  table: SeatingTable;
  assignments: SeatingAssignment[];
  onEditTable: () => void;
  onDeleteTable: () => void;
  onAssignGuest: () => void;
  onRemoveGuest: (assignmentId: number) => void;
}) {
  const assignedGuests = assignments.filter(a => a.tableId === table.id);
  const availableSeats = table.maxSeats - assignedGuests.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      <Card className="h-full border-2 hover:border-rose-200 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-rose-800 flex items-center gap-2">
              <Armchair className="h-5 w-5" />
              {table.name}
            </CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={onEditTable}>
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDeleteTable}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {assignedGuests.length} of {table.maxSeats} seats filled
          </p>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Assigned Guests */}
          <AnimatePresence>
            {assignedGuests.map((assignment) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between p-2 bg-rose-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-rose-600" />
                  <span className="text-sm font-medium">{assignment.guest.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveGuest(assignment.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <UserMinus className="h-3 w-3" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Empty Seats */}
          {Array.from({ length: availableSeats }, (_, i) => (
            <div key={i} className="p-2 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400 text-sm">
              Empty seat
            </div>
          ))}
          
          {/* Add Guest Button */}
          {availableSeats > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAssignGuest}
              className="w-full border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Guest
            </Button>
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Export functions
  const exportToPDF = () => {
    // TODO: Implement PDF export
    toast({ title: "PDF export coming soon!", description: "This feature will be available in the next update." });
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seating Chart</h1>
          <p className="text-gray-600 mt-1">
            Organize your guests into tables for the perfect wedding layout
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <FileText className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Dialog open={showTableForm} onOpenChange={setShowTableForm}>
            <DialogTrigger asChild>
              <Button>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-rose-600">{tables.length}</div>
            <div className="text-sm text-gray-600">Tables</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{assignments.length}</div>
            <div className="text-sm text-gray-600">Assigned Guests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{unassignedGuests.length}</div>
            <div className="text-sm text-gray-600">Unassigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {tables.reduce((total, table) => total + table.maxSeats, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Seats</div>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Guests */}
      {unassignedGuests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-amber-600" />
              Unassigned Guests ({unassignedGuests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {unassignedGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium"
                >
                  {guest.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tables Grid */}
      {tables.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Armchair className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tables created yet</h3>
            <p className="text-gray-600 mb-4">
              Start by creating your first table to organize your wedding seating
            </p>
            <Button onClick={() => setShowTableForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Table
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                assignments={assignments}
                onEditTable={() => setEditingTable(table)}
                onDeleteTable={() => deleteTableMutation.mutate(table.id)}
                onAssignGuest={() => setShowGuestAssignment(table)}
                onRemoveGuest={(assignmentId) => removeGuestMutation.mutate(assignmentId)}
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
    </div>
  );
}