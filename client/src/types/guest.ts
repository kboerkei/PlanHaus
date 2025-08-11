export interface Guest {
  id: number;
  projectId: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  rsvpStatus: 'pending' | 'yes' | 'no' | 'maybe';
  dietaryRestrictions?: string;
  plusOne?: string;
  group?: string;
  side?: 'bride' | 'groom' | 'both';
  partySize: number;
  tableAssignment?: number;
  notes?: string;
  invitationSent: boolean;
  invitationSentDate?: string;
  rsvpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GuestGroup {
  group: string;
  guests: Guest[];
  totalInvited: number;
  totalAttending: number;
  totalDeclined: number;
  totalPending: number;
}

export interface GuestStats {
  totalInvited: number;
  totalAttending: number;
  totalDeclined: number;
  totalPending: number;
  totalPartySize: number;
  invitationsSent: number;
  rsvpsReceived: number;
}

export type GuestInsert = Omit<Guest, 'id' | 'createdAt' | 'updatedAt'>;
export type GuestUpdate = Partial<Omit<Guest, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>>;