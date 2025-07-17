import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

interface VendorCategoryBoxProps {
  count: number;
  label: string;
  color: string;
  isActive: boolean;
  onClick: () => void;
}

function VendorCategoryBox({ count, label, color, isActive, onClick }: VendorCategoryBoxProps) {
  return (
    <div 
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg ${
        isActive 
          ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        <div className={`text-3xl font-bold mb-1`} style={{ color }}>
          {count}
        </div>
        <div className="text-sm text-gray-600 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}

interface VendorOverviewProps {
  currentProject: any;
  onCategoryFilter: (category: string | null) => void;
  activeFilter: string | null;
}

export default function VendorOverview({ currentProject, onCategoryFilter, activeFilter }: VendorOverviewProps) {
  const { data: vendors = [] } = useQuery({
    queryKey: ['/api/projects', currentProject?.id, 'vendors'],
    enabled: !!currentProject?.id
  });

  // Vendor categories with their counts and colors
  const vendorCategories = [
    { key: 'venue', label: 'Venues', color: '#8B5CF6' },
    { key: 'catering', label: 'Catering', color: '#10B981' },
    { key: 'photography', label: 'Photography', color: '#F59E0B' },
    { key: 'music', label: 'Music & DJ', color: '#EF4444' },
    { key: 'flowers', label: 'Flowers', color: '#EC4899' },
    { key: 'transportation', label: 'Transport', color: '#6366F1' },
    { key: 'beauty', label: 'Beauty', color: '#14B8A6' },
    { key: 'attire', label: 'Attire', color: '#F97316' },
  ];

  // Calculate counts for each category
  const categoryCounts = vendorCategories.map(category => {
    const categoryVendors = vendors.filter(vendor => 
      vendor.category?.toLowerCase() === category.key
    );
    return {
      ...category,
      count: categoryVendors.length,
      booked: categoryVendors.filter(v => v.status === 'booked').length,
      contacted: categoryVendors.filter(v => v.status === 'contacted').length,
      quoted: categoryVendors.filter(v => v.status === 'quoted').length,
    };
  });

  // Calculate totals
  const totalVendors = vendors.length;
  const totalBooked = vendors.filter(v => v.status === 'booked').length;
  const totalContacted = vendors.filter(v => v.status === 'contacted').length;
  const totalQuoted = vendors.filter(v => v.status === 'quoted').length;

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <VendorCategoryBox
            count={totalVendors}
            label="Total Vendors"
            color="#374151"
            isActive={activeFilter === null}
            onClick={() => onCategoryFilter(null)}
          />
          <VendorCategoryBox
            count={totalBooked}
            label="Booked"
            color="#10B981"
            isActive={activeFilter === 'booked'}
            onClick={() => onCategoryFilter('booked')}
          />
          <VendorCategoryBox
            count={totalContacted}
            label="Contacted"
            color="#F59E0B"
            isActive={activeFilter === 'contacted'}
            onClick={() => onCategoryFilter('contacted')}
          />
          <VendorCategoryBox
            count={totalQuoted}
            label="Quoted"
            color="#8B5CF6"
            isActive={activeFilter === 'quoted'}
            onClick={() => onCategoryFilter('quoted')}
          />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vendor Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categoryCounts.map((category) => (
            <VendorCategoryBox
              key={category.key}
              count={category.count}
              label={category.label}
              color={category.color}
              isActive={activeFilter === category.key}
              onClick={() => onCategoryFilter(category.key)}
            />
          ))}
        </div>
      </div>

      {/* Status Breakdown by Category (if vendors exist) */}
      {totalVendors > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Category Status Breakdown</h3>
          <div className="space-y-4">
            {categoryCounts
              .filter(category => category.count > 0)
              .map((category) => (
                <div key={category.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium text-gray-700">{category.label}</span>
                    <span className="text-sm text-gray-500">({category.count} total)</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="text-green-600 font-medium">
                      {category.booked} booked
                    </span>
                    <span className="text-yellow-600 font-medium">
                      {category.contacted} contacted
                    </span>
                    <span className="text-purple-600 font-medium">
                      {category.quoted} quoted
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}