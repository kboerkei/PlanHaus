export interface Vendor {
  id: number;
  projectId: number;
  name: string;
  category: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  status: 'researching' | 'contacted' | 'quote_requested' | 'quote_received' | 'booked' | 'paid' | 'rejected';
  rating?: number;
  cost?: number;
  notes?: string;
  contractSigned: boolean;
  depositPaid: boolean;
  finalPaymentDue?: string;
  tags?: string[];
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface VendorCategory {
  category: string;
  vendors: Vendor[];
  bookedCount: number;
  totalCost: number;
}

export interface VendorStats {
  totalVendors: number;
  bookedVendors: number;
  pendingVendors: number;
  totalCost: number;
  totalPaid: number;
  contractsSigned: number;
}

export type VendorInsert = Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>;
export type VendorUpdate = Partial<Omit<Vendor, 'id' | 'projectId' | 'createdBy' | 'createdAt' | 'updatedAt'>>;