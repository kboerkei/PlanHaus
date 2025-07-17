import { useState, useCallback, useMemo } from "react";
import { Search, Filter, X, Calendar, DollarSign, Users, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: string | number;
  label: string;
}

interface AdvancedSearchProps {
  data: any[];
  onFilter: (filteredData: any[]) => void;
  searchFields: string[];
  filterFields: {
    field: string;
    label: string;
    type: 'text' | 'number' | 'select' | 'date';
    options?: string[];
  }[];
  placeholder?: string;
  className?: string;
}

export default function AdvancedSearch({
  data,
  onFilter,
  searchFields,
  filterFields,
  placeholder = "Search...",
  className
}: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempFilter, setTempFilter] = useState({
    field: "",
    operator: "contains" as const,
    value: "",
    label: ""
  });

  // Advanced search and filtering logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply text search
    if (searchTerm.trim()) {
      result = result.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply advanced filters
    activeFilters.forEach(filter => {
      result = result.filter(item => {
        const value = item[filter.field];
        
        switch (filter.operator) {
          case 'equals':
            return value === filter.value;
          case 'contains':
            return value && value.toString().toLowerCase().includes(filter.value.toString().toLowerCase());
          case 'greater':
            return parseFloat(value) > parseFloat(filter.value.toString());
          case 'less':
            return parseFloat(value) < parseFloat(filter.value.toString());
          default:
            return true;
        }
      });
    });

    return result;
  }, [data, searchTerm, activeFilters, searchFields]);

  // Update parent with filtered data
  const updateFilter = useCallback(() => {
    onFilter(filteredData);
  }, [filteredData, onFilter]);

  // Effect to notify parent of filter changes
  useState(() => {
    updateFilter();
  });

  const addFilter = () => {
    if (!tempFilter.field || !tempFilter.value) return;

    const fieldConfig = filterFields.find(f => f.field === tempFilter.field);
    if (!fieldConfig) return;

    const newFilter: SearchFilter = {
      field: tempFilter.field,
      operator: tempFilter.operator,
      value: fieldConfig.type === 'number' ? parseFloat(tempFilter.value) : tempFilter.value,
      label: `${fieldConfig.label} ${tempFilter.operator} ${tempFilter.value}`
    };

    setActiveFilters([...activeFilters, newFilter]);
    setTempFilter({ field: "", operator: "contains", value: "", label: "" });
    setIsFilterOpen(false);
  };

  const removeFilter = (index: number) => {
    setActiveFilters(activeFilters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchTerm("");
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-20"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Add Filter</h4>
                
                <div className="space-y-3">
                  <Select value={tempFilter.field} onValueChange={(value) => 
                    setTempFilter({ ...tempFilter, field: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterFields.map((field) => (
                        <SelectItem key={field.field} value={field.field}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={tempFilter.operator} onValueChange={(value: any) => 
                    setTempFilter({ ...tempFilter, operator: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="greater">Greater than</SelectItem>
                      <SelectItem value="less">Less than</SelectItem>
                    </SelectContent>
                  </Select>

                  {tempFilter.field && (() => {
                    const fieldConfig = filterFields.find(f => f.field === tempFilter.field);
                    if (fieldConfig?.type === 'select' && fieldConfig.options) {
                      return (
                        <Select value={tempFilter.value} onValueChange={(value) => 
                          setTempFilter({ ...tempFilter, value })
                        }>
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldConfig.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }
                    
                    return (
                      <Input
                        placeholder="Enter value"
                        type={fieldConfig?.type === 'number' ? 'number' : 'text'}
                        value={tempFilter.value}
                        onChange={(e) => setTempFilter({ ...tempFilter, value: e.target.value })}
                      />
                    );
                  })()}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setIsFilterOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addFilter}>
                    Add Filter
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters */}
      {(activeFilters.length > 0 || searchTerm) && (
        <div className="flex flex-wrap items-center gap-2">
          {searchTerm && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search: "{searchTerm}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchTerm("")}
              />
            </Badge>
          )}
          
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter.label}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter(index)}
              />
            </Badge>
          ))}
          
          {(activeFilters.length > 0 || searchTerm) && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-500">
        Showing {filteredData.length} of {data.length} results
      </div>
    </div>
  );
}