export interface TripOwner {
  userId: string;
  username: string;
  name: string;
}

export interface TripMember {
  userId: string;
  username: string;
  name: string;
  joinedAt: string;
}

export interface TripRoutePoint {
  locationEventId: number;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
}

/** Resumo usado nas listagens */
export interface TripSummary {
  tripId: string;
  name: string;
  description: string | null;
  owner: TripOwner;
  groupId: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Detalhe completo incluindo membros e rota */
export interface TripDetail extends TripSummary {
  members: TripMember[];
  route: TripRoutePoint[];
}

/** Payload para criar uma viagem */
export interface CreateTripPayload {
  name: string;
  description?: string;
  groupId?: string;
  startedAt?: string;
}
