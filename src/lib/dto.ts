import type { User, Room, Equipment } from "@/generated/prisma/client";

// ✅ Միայն բրաուզերի համար նախատեսված դաշտերը
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: "PATIENT" | "THERAPIST" | "ADMIN";
};

export function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  // ❌ passwordHash, phone, createdAt — բաց թողնված են միտումնավոր
}

export type SafeRoom = {
  id: string;
  name: string;
  capacity: number;
  isActive: boolean;
};

export function toSafeRoom(room: Room): SafeRoom {
  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    isActive: room.isActive,
  };
}

export type SafeEquipment = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
};

export function toSafeEquipment(eq: Equipment): SafeEquipment {
  return {
    id: eq.id,
    name: eq.name,
    description: eq.description,
    isActive: eq.isActive,
  };
}