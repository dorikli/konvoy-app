export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'suv' | 'sport';

export interface ConvoyParticipant {
  id: string;
  name: string;
  vehicle: string;
  vehicleType: VehicleType;
  isLeader: boolean;
  distance?: string;
  distanceMeters?: number;
  speed: number;
  avatarColor: string;
  status: 'online' | 'warning' | 'idle';
  lat?: number;
  lng?: number;
  heading?: number;
  updatedAt?: number;
}

export interface BreakPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'coffee' | 'fuel' | 'restaurant' | 'view';
  setBy: string;
  createdAt: number;
}

export interface ConvoyHazard {
  id: string;
  type: 'radar' | 'accident' | 'roadwork' | 'hazard';
  title: string;
  lat: number;
  lng: number;
  reportedBy: string;
  reportedAt: number;
}

export interface VoiceMessage {
  id: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  durationSec?: number;
  audioUrl?: string;
}

export interface ActiveConvoy {
  code: string;
  name: string;
  leaderName: string;
  destination: string;
  totalDistance: string;
  currentSpeed: number;
  participants: ConvoyParticipant[];
  createdAt: string;
  destinationLat?: number;
  destinationLng?: number;
  kickedUserIds?: string[];
  breakPoint?: BreakPoint | null;
  hazards?: ConvoyHazard[];
  lastVoiceMessage?: VoiceMessage | null;
}

export interface DartCodeSnippet {
  id: string;
  filename: string;
  path: string;
  description: string;
  language: string;
  code: string;
}

