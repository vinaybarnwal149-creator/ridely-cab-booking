import {
  Profile,
  DriverProfile,
  RideType,
  Ride,
  RideOffer,
  Payment,
  DriverEarning,
  PromoCode,
  Rating,
  Notification,
  EmergencyContact,
  SosEvent,
  SupportTicket,
  TicketMessage,
} from "../types";

// Seed ride types per PRD §4.3
export const SEED_RIDE_TYPES: RideType[] = [
  {
    code: "bike",
    name: "Bike",
    capacity: 1,
    baseFarePaise: 1500,
    perKmPaise: 600,
    perMinPaise: 80,
    minFarePaise: 3000,
    icon: "bike",
    isActive: true,
    sortOrder: 1,
  },
  {
    code: "auto",
    name: "Auto",
    capacity: 3,
    baseFarePaise: 2500,
    perKmPaise: 1000,
    perMinPaise: 100,
    minFarePaise: 4000,
    icon: "auto",
    isActive: true,
    sortOrder: 2,
  },
  {
    code: "mini",
    name: "Mini",
    capacity: 4,
    baseFarePaise: 4000,
    perKmPaise: 1200,
    perMinPaise: 150,
    minFarePaise: 7000,
    icon: "car",
    isActive: true,
    sortOrder: 3,
  },
  {
    code: "sedan",
    name: "Sedan",
    capacity: 4,
    baseFarePaise: 5000,
    perKmPaise: 1500,
    perMinPaise: 200,
    minFarePaise: 9000,
    icon: "sedan",
    isActive: true,
    sortOrder: 4,
  },
  {
    code: "xl",
    name: "XL",
    capacity: 6,
    baseFarePaise: 7000,
    perKmPaise: 2000,
    perMinPaise: 250,
    minFarePaise: 13000,
    icon: "suv",
    isActive: true,
    sortOrder: 5,
  },
];

// Seed promo codes per PRD §4.9
export const SEED_PROMO_CODES: PromoCode[] = [
  {
    id: "promo_welcome50",
    code: "WELCOME50",
    description: "50% off on your first ride up to ₹100",
    type: "percent",
    value: 50,
    maxDiscountPaise: 10000,
    minFarePaise: 0,
    validFrom: new Date(Date.now() - 86400000).toISOString(),
    perUserLimit: 1,
    firstRideOnly: true,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "promo_flat30",
    code: "FLAT30",
    description: "Flat ₹30 off on rides above ₹150",
    type: "flat",
    value: 3000,
    minFarePaise: 15000,
    validFrom: new Date(Date.now() - 86400000).toISOString(),
    perUserLimit: 5,
    firstRideOnly: false,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Global in-memory data store for serverless instance resilience
class DatabaseStore {
  profiles: Map<string, Profile> = new Map();
  driverProfiles: Map<string, DriverProfile> = new Map();
  rideTypes: Map<string, RideType> = new Map();
  rides: Map<string, Ride> = new Map();
  rideOffers: Map<string, RideOffer> = new Map();
  payments: Map<string, Payment> = new Map();
  driverEarnings: Map<string, DriverEarning> = new Map();
  promoCodes: Map<string, PromoCode> = new Map();
  ratings: Map<string, Rating> = new Map();
  notifications: Map<string, Notification> = new Map();
  emergencyContacts: Map<string, EmergencyContact> = new Map();
  sosEvents: Map<string, SosEvent> = new Map();
  supportTickets: Map<string, SupportTicket> = new Map();
  ticketMessages: Map<string, TicketMessage> = new Map();
  appSettings: Map<string, unknown> = new Map();

  constructor() {
    this.seed();
  }

  seed() {
    // Populate ride types
    SEED_RIDE_TYPES.forEach((rt) => this.rideTypes.set(rt.code, rt));

    // Populate promo codes
    SEED_PROMO_CODES.forEach((pc) => this.promoCodes.set(pc.code, pc));

    // Seed default admin
    this.profiles.set("user_admin", {
      id: "user_admin",
      role: "admin",
      fullName: "Ridely Admin",
      email: "admin@ridely.local",
      phone: "+919820011223",
      isSuspended: false,
      emailNotifications: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed default rider
    this.profiles.set("user_rider_1", {
      id: "user_rider_1",
      role: "rider",
      fullName: "Rahul Sharma",
      email: "rider@ridely.local",
      phone: "+919876543210",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      isSuspended: false,
      emailNotifications: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Seed emergency contacts for rider
    this.emergencyContacts.set("em_1", {
      id: "em_1",
      userId: "user_rider_1",
      name: "Pooja Sharma (Sister)",
      phone: "+919876543211",
      email: "pooja.sharma@example.com",
      createdAt: new Date().toISOString(),
    });

    // Seed drivers in Mumbai
    const drivers = [
      {
        id: "driver_1",
        name: "Vikram Singh",
        phone: "+919123456789",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
        vehicleMake: "Maruti",
        vehicleModel: "Swift Dzire",
        vehiclePlate: "MH 02 BG 4512",
        vehicleColor: "Silver",
        rideTypeCode: "mini",
        lat: 19.0728, // Bandra
        lng: 72.8682,
        avgRating: 4.88,
        ratingCount: 142,
      },
      {
        id: "driver_2",
        name: "Ramesh Patel",
        phone: "+919123456788",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
        vehicleMake: "Hyundai",
        vehicleModel: "Aura",
        vehiclePlate: "MH 01 CV 8821",
        vehicleColor: "White",
        rideTypeCode: "sedan",
        lat: 19.0760, // BKC
        lng: 72.8777,
        avgRating: 4.92,
        ratingCount: 210,
      },
      {
        id: "driver_3",
        name: "Santosh Kumar",
        phone: "+919123456787",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
        vehicleMake: "Bajaj",
        vehicleModel: "Compact RE",
        vehiclePlate: "MH 03 DR 1109",
        vehicleColor: "Black & Yellow",
        rideTypeCode: "auto",
        lat: 19.0800,
        lng: 72.8850,
        avgRating: 4.75,
        ratingCount: 88,
      },
    ];

    drivers.forEach((d) => {
      this.profiles.set(d.id, {
        id: d.id,
        role: "driver",
        fullName: d.name,
        email: `${d.id}@ridely.local`,
        phone: d.phone,
        avatarUrl: d.avatar,
        isSuspended: false,
        emailNotifications: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      this.driverProfiles.set(d.id, {
        userId: d.id,
        status: "approved",
        rideTypeCode: d.rideTypeCode,
        vehicleMake: d.vehicleMake,
        vehicleModel: d.vehicleModel,
        vehiclePlate: d.vehiclePlate,
        vehicleColor: d.vehicleColor,
        isOnline: true,
        isBusy: false,
        currentLat: d.lat,
        currentLng: d.lng,
        heading: 90,
        locationUpdatedAt: new Date().toISOString(),
        avgRating: d.avgRating,
        ratingCount: d.ratingCount,
        totalRides: d.ratingCount + 10,
        acceptanceRate: 98.5,
        approvedAt: new Date().toISOString(),
        approvedBy: "user_admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // Seed initial app settings
    this.appSettings.set("surge", {
      enabled: true,
      cap: 2.0,
      tiers: [
        { ratio: 1, mult: 1.2 },
        { ratio: 2, mult: 1.5 },
        { ratio: 3, mult: 2.0 },
      ],
    });
    this.appSettings.set("commission_percent", 20);
    this.appSettings.set("cancellation_fee_paise", 3000);
    this.appSettings.set("booking_fee_paise", 500);
  }
}

// Global singleton
declare global {
  // eslint-disable-next-line no-var
  var __ridely_db: DatabaseStore | undefined;
}

export const db: DatabaseStore = globalThis.__ridely_db || new DatabaseStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.__ridely_db = db;
}

