import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  MoreVertical, 
  Grid, 
  List, 
  ChevronLeft, 
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'badge' | 'action';
  render?: (value: any, item: any) => React.ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

interface ResponsiveDataTableProps {
  data: any[];
  columns: Column[];
  onRowClick?: (item: any) => void;
  onRowSelect?: (selectedItems: any[]) => void;
  enableSelection?: boolean;
  enablePagination?: boolean;
  pageSize?: number;
  viewMode?: 'table' | 'grid' | 'auto';
  className?: string;
  emptyState?: React.ReactNode;
}

export default function ResponsiveDataTable({
  data,
  columns,
  onRowClick,
  onRowSelect,
  enableSelection = false,
  enablePagination = true,
  pageSize = 10,
  viewMode = 'auto',
  className,
  emptyState
}: ResponsiveDataTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [currentViewMode, setCurrentViewMode] = useState<'table' | 'grid'>(
    viewMode === 'auto' ? 'table' : viewMode
  );

  // Sorting logic
  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue === bValue) return 0;
    
    const comparison = aValue < bValue ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = enablePagination 
    ? sortedData.slice(startIndex, endIndex)
    : sortedData;

  const handleSort = (columnKey: string) => {
    const column = columns.find(c => c.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(paginatedData);
    } else {
      setSelectedItems([]);
    }
    onRowSelect?.(checked ? paginatedData : []);
  };

  const handleSelectItem = (item: any, checked: boolean) => {
    let newSelection;
    if (checked) {
      newSelection = [...selectedItems, item];
    } else {
      newSelection = selectedItems.filter(selected => selected !== item);
    }
    setSelectedItems(newSelection);
    onRowSelect?.(newSelection);
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="h-4 w-4" />
      : <ArrowDown className="h-4 w-4" />;
  };

  const renderCellValue = (column: Column, item: any) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }
    
    switch (column.type) {
      case 'badge':
        return <Badge variant="outline">{value}</Badge>;
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      default:
        return value || '-';
    }
  };

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-12">
          {emptyState || (
            <div className="text-center text-gray-500">
              <p>No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {paginatedData.length} of {data.length} items
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant={currentViewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setCurrentViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={currentViewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setCurrentViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table View */}
      {currentViewMode === 'table' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  {enableSelection && (
                    <th className="p-4 text-left">
                      <Checkbox
                        checked={selectedItems.length === paginatedData.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "p-4 text-left font-medium text-gray-700",
                        column.sortable && "cursor-pointer hover:bg-gray-50",
                        column.mobileHidden && "hidden md:table-cell",
                        column.className
                      )}
                      onClick={() => handleSort(column.key)}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{column.label}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-b hover:bg-gray-50 transition-colors",
                      onRowClick && "cursor-pointer"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {enableSelection && (
                      <td className="p-4">
                        <Checkbox
                          checked={selectedItems.includes(item)}
                          onCheckedChange={(checked) => handleSelectItem(item, checked)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(
                          "p-4",
                          column.mobileHidden && "hidden md:table-cell",
                          column.className
                        )}
                      >
                        {renderCellValue(column, item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grid View */}
      {currentViewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedData.map((item, index) => (
            <Card
              key={index}
              className={cn(
                "transition-all hover:shadow-md",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              <CardContent className="p-4">
                {enableSelection && (
                  <div className="flex justify-end mb-2">
                    <Checkbox
                      checked={selectedItems.includes(item)}
                      onCheckedChange={(checked) => handleSelectItem(item, checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  {columns.slice(0, 4).map((column) => (
                    <div key={column.key} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        {column.label}:
                      </span>
                      <span className="text-sm">
                        {renderCellValue(column, item)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {enablePagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}