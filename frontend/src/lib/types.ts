export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales";
};

export type Lead = {
  id: string;
  name: string;
  email?: string | null;
  phone: string;
  stage: string;
  followUpDate: string | null;
  assignedToId?: string | null;
};

export type Note = {
  id: string;
  content: string;
  followUpDate: string | null;
  createdAt: string;
};

export type Dashboard = {
  leadCount: number;
  followUpCount: number;
  availableUnits: number;
  bookedUnits: number;
  bookingCount: number;
  stageCounts: { stage: string; count: number }[];
  recentBookings: Booking[];
};

export type Booking = {
  id: string;
  lead?: { name: string };
  unit?: { unitNumber: string; type: string };
  bookedAt: string;
};

export type Unit = {
  id: string;
  unitNumber: string;
  type: string;
  price: string;
  status: string;
};

export type Project = {
  id: string;
  name: string;
  location: string;
  buildings: { id: string; name: string; units: Unit[] }[];
};

export type View = "Overview" | "Leads" | "Properties" | "Bookings";
