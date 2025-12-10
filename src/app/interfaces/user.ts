import { UserRole } from "@prisma/client";

export type IAuthUser = {
  id?: string;
  email: string;
  role: UserRole;
} | null;

export interface IMatchParams {
  destination?: string;
  startDateTime?: string;
  endDateTime?: string;
  travelInterests?: string;
  travelType?: string;
  searchTerm?: string;
}