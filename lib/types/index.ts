export type UserRole = "rider" | "driver" | "admin";
export type DriverStatus = "pending" | "approved" | "rejected" | "suspended";
export type RideStatus =
  | "requested"
  | "accepted"
  | "arrived"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "expired";
export type PaymentMethodType = "card" | "cash";
export type PaymentStatus =
  | "pending"
  | "processing"
  | "succeeded"
  | "failed"
  | "refunded"
  | "partially_refunded";
export type OfferStatus = "pending" | "accepted" | "declined" | "expired" | "cancelled";
export type EarningStatus = "pending" | "paid";
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketCategory =
  | "payment"
  | "lost_item"
  | "driver_behaviour"
  | "ride_issue"
  | "app_bug"
  | "other";
export type SosStatus = "active" | "resolved";
export type PromoType = "percent" | "flat";

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  stripeCustomerId?: string;
  isSuspended: boolean;
  emailNotifications: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RideType {
  code: string;
  name: string;
  capacity: number;
  baseFarePaise: number;
  perKmPaise: number;
  perMinPaise: number;
  minFarePaise: number;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface DriverProfile {
  userId: string;
  status: DriverStatus;
  rejectionReason?: string;
  rideTypeCode?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
  vehiclePlate?: string;
  licenseNumber?: string;
  licenseExpiry?: string;
  licenseDocPath?: string;
  isOnline: boolean;
  isBusy: boolean;
  currentLat?: number;
  currentLng?: number;
  heading?: number;
  locationUpdatedAt?: string;
  avgRating: number;
  ratingCount: number;
  totalRides: number;
  acceptanceRate: number;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export interface RideStop {
  id?: string;
  seq: number;
  address: string;
  lat: number;
  lng: number;
  reachedAt?: string;
}

export interface FareBreakdown {
  basePaise: number;
  distancePaise: number;
  timePaise: number;
  surgePaise: number;
  bookingFeePaise: number;
  discountPaise: number;
}

export interface RideOption {
  rideTypeCode: string;
  name: string;
  capacity: number;
  etaToPickupMin: number | null;
  totalPaise: number;
  breakdown: FareBreakdown;
}

export interface FareQuote {
  id: string;
  riderId: string;
  pickup: { lat: number; lng: number; address: string };
  dropoff: { lat: number; lng: number; address: string };
  stops: RideStop[];
  distanceM: number;
  durationS: number;
  polyline: string;
  surgeMultiplier: number;
  options: RideOption[];
  expiresAt: string;
  createdAt: string;
}

export interface Ride {
  id: string;
  riderId: string;
  driverId?: string;
  rideTypeCode: string;
  status: RideStatus;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  dropoffAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  stops: RideStop[];
  routePolyline: string;
  quotedDistanceM: number;
  quotedDurationS: number;
  actualDistanceM?: number;
  actualDurationS?: number;
  surgeMultiplier: number;
  baseFarePaise: number;
  distanceFarePaise: number;
  timeFarePaise: number;
  surgeAmountPaise: number;
  bookingFeePaise: number;
  discountPaise: number;
  promoCodeId?: string;
  totalFarePaise: number;
  cancellationFeePaise: number;
  paymentMethod: PaymentMethodType;
  otpCode: string;
  otpAttempts: number;
  cancelledBy?: UserRole;
  cancelReason?: string;
  requestedAt: string;
  acceptedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  matchRound: number;
  createdAt: string;
  updatedAt: string;

  // Joined public info
  driver?: {
    name: string;
    avatarUrl?: string;
    avgRating: number;
    ratingCount: number;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    vehiclePlate?: string;
    phone?: string;
    currentLat?: number;
    currentLng?: number;
  };
  rider?: {
    name: string;
    avatarUrl?: string;
    phone?: string;
  };
}

export interface RideOffer {
  id: string;
  rideId: string;
  driverId: string;
  status: OfferStatus;
  distanceToPickupM?: number;
  round: number;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
  ride?: Ride;
}

export interface Payment {
  id: string;
  rideId: string;
  riderId: string;
  method: PaymentMethodType;
  amountPaise: number;
  currency: string;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  failureReason?: string;
  refundedPaise: number;
  receiptNumber?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverEarning {
  id: string;
  driverId: string;
  rideId: string;
  grossPaise: number;
  commissionPaise: number;
  netPaise: number;
  commissionPercent: number;
  status: EarningStatus;
  paidOutAt?: string;
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  type: PromoType;
  value: number;
  maxDiscountPaise?: number;
  minFarePaise: number;
  validFrom: string;
  validTo?: string;
  globalLimit?: number;
  perUserLimit: number;
  firstRideOnly: boolean;
  rideTypeCodes?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface Rating {
  id: string;
  rideId: string;
  raterId: string;
  rateeId: string;
  raterRole: UserRole;
  stars: number;
  tags: string[];
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body?: string;
  data: Record<string, unknown>;
  readAt?: string;
  createdAt: string;
}

export interface SosEvent {
  id: string;
  rideId: string;
  riderId: string;
  status: SosStatus;
  publicToken: string;
  tokenExpiresAt: string;
  lat?: number;
  lng?: number;
  contactsNotified: { name: string; phone: string; email?: string }[];
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  rideId?: string;
  category: TicketCategory;
  subject: string;
  status: TicketStatus;
  assignedAdminId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  isAdmin: boolean;
  body: string;
  attachments: string[];
  createdAt: string;
}

