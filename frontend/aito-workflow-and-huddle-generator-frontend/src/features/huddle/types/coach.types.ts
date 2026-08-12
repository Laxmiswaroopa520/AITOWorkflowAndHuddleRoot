export interface CoachResponse { externalId: string; displayName: string; jobTitle: string | null; biography: string | null; expertise: string[]; timeZone: string }
export interface CoachAvailabilitySlotResponse { startUtc: string; endUtc: string }
export interface CoachAvailabilityResponse { coachExternalId: string; coachTimeZone: string; slots: CoachAvailabilitySlotResponse[] }
export interface BookCoachRequest { coachExternalId: string; huddleExternalId: string; startUtc: string; endUtc: string; displayTimeZone: string; question: string | null; bookingRequestId: string }
export interface CoachBookingResponse { eventId: string; coachExternalId: string; coachDisplayName: string; startUtc: string; endUtc: string; joinUrl: string | null; webLink: string | null }
