export interface Vendor {
  id: number;
  name: string;
  category: string;
  status: 'contacted' | 'shortlisted' | 'booked' | 'declined';
  email?: string;
  phone?: string;
  estimatedCost?: string;
  actualCost?: string;
}

export interface VendorFunnelData {
  stages: Array<{
    label: string;
    value: number;
    color: string;
  }>;
}

const VENDOR_STAGE_COLORS = {
  contacted: '#3B82F6', // blue-500
  shortlisted: '#F59E0B', // amber-500
  booked: '#10B981', // emerald-500
  declined: '#EF4444' // red-500
};

export function toFunnel(vendors: Vendor[]): VendorFunnelData {
  const contacted = vendors.filter(v => v.status === 'contacted').length;
  const shortlisted = vendors.filter(v => v.status === 'shortlisted').length;
  const booked = vendors.filter(v => v.status === 'booked').length;
  const declined = vendors.filter(v => v.status === 'declined').length;
  
  return {
    stages: [
      {
        label: 'Contacted',
        value: contacted,
        color: VENDOR_STAGE_COLORS.contacted
      },
      {
        label: 'Shortlisted',
        value: shortlisted,
        color: VENDOR_STAGE_COLORS.shortlisted
      },
      {
        label: 'Booked',
        value: booked,
        color: VENDOR_STAGE_COLORS.booked
      }
    ]
  };
}

export function getVendorCategoryBreakdown(vendors: Vendor[]): {
  [category: string]: number;
} {
  const breakdown: { [category: string]: number } = {};
  
  vendors.forEach(vendor => {
    const category = vendor.category || 'Other';
    breakdown[category] = (breakdown[category] || 0) + 1;
  });
  
  return breakdown;
}

export function getVendorCostAnalysis(vendors: Vendor[]): {
  totalEstimated: number;
  totalActual: number;
  variance: number;
  bookedVendors: number;
} {
  const bookedVendors = vendors.filter(v => v.status === 'booked');
  
  const totalEstimated = bookedVendors.reduce((sum, v) => 
    sum + parseFloat(v.estimatedCost || '0'), 0
  );
  
  const totalActual = bookedVendors.reduce((sum, v) => 
    sum + parseFloat(v.actualCost || '0'), 0
  );
  
  const variance = totalActual - totalEstimated;
  
  return {
    totalEstimated,
    totalActual,
    variance,
    bookedVendors: bookedVendors.length
  };
}

export function getVendorConversionRates(vendors: Vendor[]): {
  contactedToShortlisted: number;
  shortlistedToBooked: number;
  overallConversion: number;
} {
  const contacted = vendors.filter(v => v.status === 'contacted').length;
  const shortlisted = vendors.filter(v => v.status === 'shortlisted').length;
  const booked = vendors.filter(v => v.status === 'booked').length;
  
  const contactedToShortlisted = contacted > 0 ? (shortlisted / contacted) * 100 : 0;
  const shortlistedToBooked = shortlisted > 0 ? (booked / shortlisted) * 100 : 0;
  const overallConversion = contacted > 0 ? (booked / contacted) * 100 : 0;
  
  return {
    contactedToShortlisted,
    shortlistedToBooked,
    overallConversion
  };
} 