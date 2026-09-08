import type { Booking, Dashboard, Lead, Note, Project, User } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

type ApiErrorPayload = {
  message?: string;
  issues?: { fieldErrors?: Record<string, string[]> };
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "The service is temporarily unavailable. Please try again.",
    );
  }

  let payload: ApiErrorPayload = {};
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      throw new Error("The service returned an invalid response.");
    }
  }
  if (!response.ok) {
    if (response.status === 401 && token && typeof window !== "undefined") {
      localStorage.removeItem("estateflow-token");
      localStorage.removeItem("estateflow-user");
      window.location.replace("/");
    }
    const fieldMessage = Object.values(
      payload.issues?.fieldErrors ?? {},
    ).flat()[0];
    throw new Error(fieldMessage ?? payload.message ?? "Request failed");
  }
  return payload as T;
}

export const login = (email: string, password: string) =>
  request<{ token: string; user: User }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getDashboard = (token: string) =>
  request<Dashboard>("/dashboard/summary", {}, token);
export const getLeads = (token: string) => request<Lead[]>("/leads", {}, token);
export const getProperties = (token: string) =>
  request<Project[]>("/properties", {}, token);
export const getBookings = (token: string) =>
  request<Booking[]>("/bookings", {}, token);
export const getUsers = (token: string) => request<User[]>("/users", {}, token);
export const createLead = (
  token: string,
  input: {
    name: string;
    phone: string;
    email: string | null;
    followUpDate: string | null;
    assignedToId?: string | null;
  },
) =>
  request<Lead>(
    "/leads",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
export const getNotes = (token: string, leadId: string) =>
  request<Note[]>(`/leads/${leadId}/notes`, {}, token);
export const createNote = (
  token: string,
  leadId: string,
  input: { content: string; followUpDate: string | null },
) =>
  request<Note>(
    `/leads/${leadId}/notes`,
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
export const getLead = (token: string, id: string) =>
  request<Lead>(`/leads/${id}`, {}, token);
export const updateLead = (
  token: string,
  id: string,
  input: Partial<{
    name: string;
    phone: string;
    email: string | null;
    stage: string;
    followUpDate: string | null;
    assignedToId: string | null;
  }>,
) =>
  request<Lead>(
    `/leads/${id}`,
    { method: "PATCH", body: JSON.stringify(input) },
    token,
  );
export const createBooking = (
  token: string,
  input: { leadId: string; unitId: string },
) =>
  request<Booking>(
    "/bookings",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
export const createProject = (
  token: string,
  input: { name: string; location: string; description: string | null },
) =>
  request<Project>(
    "/properties/projects",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
export const createBuilding = (
  token: string,
  input: { projectId: string; name: string; totalFloors: number | null },
) =>
  request(
    "/properties/buildings",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
export const createUnit = (
  token: string,
  input: {
    buildingId: string;
    unitNumber: string;
    type: string;
    price: number;
    status: "available" | "blocked";
  },
) =>
  request(
    "/properties/units",
    { method: "POST", body: JSON.stringify(input) },
    token,
  );
