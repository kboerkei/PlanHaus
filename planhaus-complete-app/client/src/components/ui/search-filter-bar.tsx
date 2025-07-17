import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";

interface SearchFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    key: string;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
  }[];
  quickFilters?: {
    label: string;
    value: string;
    count?: number;
    active: boolean;
    onClick: () => void;
  }[];
  placeholder?: string;
}

export default function SearchFilterBar({
  searchTerm,
  onSearchChange,
  filters,
  quickFilters = [],
  placeholder = "Search..."
}: SearchFilterBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const activeFiltersCount = filters.filter(f => f.value).length;

  const clearAllFilters = () => {
    onSearchChange("");
    filters.forEach(filter => filter.onChange("all"));
  };

  return (
    <div className="space-y-4">
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder={placeholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={activeFiltersCount > 0 ? "default" : "outline"}
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="shrink-0"
        >
          <Filter size={16} className="mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="ml-2 bg-white text-blue-600">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        {(searchTerm || activeFiltersCount > 0) && (
          <Button variant="ghost" onClick={clearAllFilters}>
            <X size={16} />
          </Button>
        )}
      </div>

      {/* Quick filters */}
      {quickFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <Button
              key={filter.value}
              variant={filter.active ? "default" : "outline"}
              size="sm"
              onClick={filter.onClick}
              className="text-sm"
            >
              {filter.label}
              {filter.count !== undefined && (
                <Badge variant="secondary" className="ml-2">
                  {filter.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      )}

      {/* Advanced filters */}
      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {filter.label}
              </label>
              <Select value={filter.value} onValueChange={filter.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All {filter.label}s</SelectItem>
                  {filter.options.filter(opt => opt.value && opt.value.trim() !== '').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}