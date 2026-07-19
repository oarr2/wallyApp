import type { Prisma } from "@prisma/client";
import prisma from "@/lib/data/prisma";
import { canManageVenue } from "@/lib/auth/authorization";
import type { UserProfileWithVenue } from "@/lib/data/user-profiles";

export type CourtClient = Pick<Prisma.TransactionClient, "court" | "sport">;

export async function listActiveCourtsForVenue(
  venueId: string,
  client: CourtClient = prisma
) {
  return client.court.findMany({
    where: {
      venueId,
      isActive: true
    },
    include: {
      courtSports: {
        where: {
          isActive: true,
          sport: { isActive: true }
        },
        include: { sport: true },
        orderBy: { sport: { name: "asc" } }
      }
    },
    orderBy: { displayOrder: "asc" }
  });
}

export async function listActiveCourtsForAdminVenue(
  input: {
    actor: Pick<UserProfileWithVenue, "role" | "venueId">;
    venueId: string;
  },
  client: CourtClient = prisma
) {
  if (!canManageVenue(input.actor, input.venueId)) {
    throw new Error("No tienes permiso para ver las canchas de este venue.");
  }

  return listActiveCourtsForVenue(input.venueId, client);
}

export async function getActiveCourtForVenue(
  input: { courtId: string; venueId: string },
  client: CourtClient = prisma
) {
  return client.court.findFirst({
    where: {
      id: input.courtId,
      venueId: input.venueId,
      isActive: true
    },
    include: {
      courtSports: {
        where: {
          isActive: true,
          sport: { isActive: true }
        },
        include: { sport: true }
      }
    }
  });
}

export async function listActiveSportsForCourt(
  courtId: string,
  client: CourtClient = prisma
) {
  const court = await client.court.findFirst({
    where: {
      id: courtId,
      isActive: true
    },
    select: {
      courtSports: {
        where: {
          isActive: true,
          sport: { isActive: true }
        },
        include: { sport: true },
        orderBy: { sport: { name: "asc" } }
      }
    }
  });

  return court?.courtSports.map((courtSport) => courtSport.sport) ?? [];
}

export async function listActiveSports(client: CourtClient = prisma) {
  return client.sport.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
}
