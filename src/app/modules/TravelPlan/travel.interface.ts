
export type ITravelPlan = {
  startDateTime: string;
  endDateTime: string;
  destination: string;
  budgetRange?: string;
  travelType?: "SOLO" | "FAMILY" | "FRIENDS";
  itinerary?: string;
  visibility?: "PUBLIC" | "PRIVATE";
};

export type IFilterRequest = {
    startDate?: string | undefined;
    endDate?: string | undefined;
}