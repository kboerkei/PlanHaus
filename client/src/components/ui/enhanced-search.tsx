import * as React from "react"
import { useState, useCallback, useMemo } from "react"
import { Search, X, Filter, SortAsc, SortDesc } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { WeddingButton } from "./wedding-button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"

interface SearchFilter {
  id: string
  label: string
  value: string
  color?: string
}

interface SortOption {
  id: string
  label: string
  value: string
  direction?: 'asc' | 'desc'
}

interface EnhancedSearchProps {
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  filters?: SearchFilter[]
  activeFilters?: string[]
  onFiltersChange?: (filters: string[]) => void
  sortOptions?: SortOption[]
  activeSort?: string
  onSortChange?: (sort: string) => void
  className?: string
  showFilterCount?: boolean
  clearable?: boolean
}

const EnhancedSearch = React.forwardRef<HTMLInputElement, EnhancedSearchProps>(
  ({ 
    placeholder = "Search...",
    value = "",
    onValueChange,
    filters = [],
    activeFilters = [],
    onFiltersChange,
    sortOptions = [],
    activeSort = "",
    onSortChange,
    className,
    showFilterCount = true,
    clearable = true,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    const handleFilterToggle = useCallback((filterId: string) => {
      const newFilters = activeFilters.includes(filterId)
        ? activeFilters.filter(f => f !== filterId)
        : [...activeFilters, filterId]
      onFiltersChange?.(newFilters)
    }, [activeFilters, onFiltersChange])

    const handleClearFilters = useCallback(() => {
      onFiltersChange?.([])
    }, [onFiltersChange])

    const handleClearSearch = useCallback(() => {
      onValueChange?.("")
    }, [onValueChange])

    const handleSortChange = useCallback((sortId: string) => {
      onSortChange?.(sortId)
    }, [onSortChange])

    const activeFilterLabels = useMemo(() => {
      return filters.filter(f => activeFilters.includes(f.id))
    }, [filters, activeFilters])

    const activeSortOption = useMemo(() => {
      return sortOptions.find(s => s.id === activeSort)
    }, [sortOptions, activeSort])

    return (
      <div className={cn("w-full space-y-3", className)}>
        {/* Search Input */}
        <div className="relative">
          <div className={cn(
            "relative flex items-center",
            "bg-white border border-gray-200 rounded-lg transition-all duration-200",
            isFocused && "border-blush shadow-sm ring-2 ring-blush/10"
          )}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              ref={ref}
              value={value}
              onChange={(e) => onValueChange?.(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="pl-10 pr-20 border-0 focus:ring-0 focus:border-0 bg-transparent h-11"
              {...props}
            />
            
            {/* Clear and Filter Controls */}
            <div className="absolute right-2 flex items-center space-x-1">
              {clearable && value && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-7 w-7 p-0 hover:bg-gray-100"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              
              {filters.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 w-7 p-0 hover:bg-gray-100",
                        activeFilters.length > 0 && "bg-blush/10 text-blush hover:bg-blush/20"
                      )}
                    >
                      <Filter className="w-3 h-3" />
                      {showFilterCount && activeFilters.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-blush text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {activeFilters.length}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {filters.map((filter) => (
                      <DropdownMenuItem
                        key={filter.id}
                        onClick={() => handleFilterToggle(filter.id)}
                        className="flex items-center justify-between"
                      >
                        <span>{filter.label}</span>
                        {activeFilters.includes(filter.id) && (
                          <div className="w-2 h-2 bg-blush rounded-full" />
                        )}
                      </DropdownMenuItem>
                    ))}
                    {activeFilters.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleClearFilters} className="text-red-600">
                          Clear filters
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              
              {sortOptions.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-7 w-7 p-0 hover:bg-gray-100",
                        activeSort && "bg-blush/10 text-blush hover:bg-blush/20"
                      )}
                    >
                      {activeSortOption?.direction === 'desc' ? (
                        <SortDesc className="w-3 h-3" />
                      ) : (
                        <SortAsc className="w-3 h-3" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sortOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.id}
                        onClick={() => handleSortChange(option.id)}
                        className="flex items-center justify-between"
                      >
                        <span>{option.label}</span>
                        {activeSort === option.id && (
                          <div className="w-2 h-2 bg-blush rounded-full" />
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterLabels.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Filters:</span>
            {activeFilterLabels.map((filter) => (
              <Badge
                key={filter.id}
                variant="secondary"
                className="bg-blush/10 text-blush border-blush/20 hover:bg-blush/20 cursor-pointer"
                onClick={() => handleFilterToggle(filter.id)}
              >
                {filter.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            <WeddingButton
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-6 text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </WeddingButton>
          </div>
        )}

        {/* Active Sort Display */}
        {activeSortOption && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 font-medium">Sorted by:</span>
            <Badge variant="outline" className="text-xs">
              {activeSortOption.label}
              {activeSortOption.direction === 'desc' ? (
                <SortDesc className="w-3 h-3 ml-1" />
              ) : (
                <SortAsc className="w-3 h-3 ml-1" />
              )}
            </Badge>
          </div>
        )}
      </div>
    )
  }
)
EnhancedSearch.displayName = "EnhancedSearch"

export { EnhancedSearch }