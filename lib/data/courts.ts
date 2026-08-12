import { AuditEntityType, AuditSource, type Court, type Prisma } from "@prisma/client";
import prisma from "@/lib/data/prisma";
import { canManageVenue } from "@/lib/auth/authorization";
import { appendAuditRecord } from "@/lib/data/audit";
import type { UserProfileWithVenue } from "@/lib/data/user-profiles";
import type { CourtInput } from "@/lib/validation/admin";

export type CourtClient = Pick<
  Prisma.TransactionClient,
  "auditRecord" | "court" | "courtSport" | "sport"
>;

type TransactionRunner = Pick<typeof prisma, "$transaction">;

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

export async function listAdminCourts(
  input: {
    actor: Pick<UserProfileWithVenue, "role" | "venueId">;
    venueId?: string | null;
  },
  client: CourtClient = prisma
) {
  const venueId = resolveAdminVenueId(input.actor, input.venueId);

  return client.court.findMany({
    where: venueId ? { venueId } : undefined,
    include: {
      courtSports: {
        include: { sport: true },
        orderBy: { sport: { name: "asc" } }
      }
    },
    orderBy: [{ venueId: "asc" }, { displayOrder: "asc" }, { name: "asc" }]
  });
}

export async function upsertCourtForAdmin(
  input: CourtInput & {
    actor: Pick<UserProfileWithVenue, "id" | "role" | "venueId">;
  },
  client: TransactionRunner = prisma
): Promise<Court> {
  return client.$transaction(async (tx) => {
    if (!canManageVenue(input.actor, input.venueId)) {
      throw new Error("No tienes permiso para administrar canchas de este venue.");
    }

    const activeSports = await tx.sport.findMany({
      where: { id: { in: input.sportIds }, isActive: true },
      select: { id: true }
    });

    if (activeSports.length !== input.sportIds.length) {
      throw new Error("Selecciona deportes activos válidos para la cancha.");
    }

    const beforeCourt = input.courtId
      ? await tx.court.findUnique({
          where: { id: input.courtId },
          include: { courtSports: true }
        })
      : null;

    if (input.courtId && (!beforeCourt || beforeCourt.venueId !== input.venueId)) {
      throw new Error("No encontramos esa cancha dentro del venue permitido.");
    }

    const court = input.courtId
      ? await tx.court.update({
          where: { id: input.courtId },
          data: {
            name: input.name,
            description: input.description ?? null,
            isActive: input.isActive,
            displayOrder: input.displayOrder
          }
        })
      : await tx.court.create({
          data: {
            venueId: input.venueId,
            name: input.name,
            description: input.description ?? null,
            isActive: input.isActive,
            displayOrder: input.displayOrder
          }
        });

    await tx.courtSport.deleteMany({ where: { courtId: court.id } });
    await tx.courtSport.createMany({
      data: input.sportIds.map((sportId) => ({
        courtId: court.id,
        sportId,
        isActive: true
      }))
    });

    const afterCourt = await tx.court.findUnique({
      where: { id: court.id },
      include: { courtSports: true }
    });

    await appendAuditRecord(
      {
        entityType: AuditEntityType.COURT,
        entityId: court.id,
        action: input.courtId ? "COURT_UPDATED" : "COURT_CREATED",
        actorUserId: input.actor.id,
        actorRole: input.actor.role,
        source: AuditSource.USER,
        beforeState: beforeCourt ? courtAuditState(beforeCourt) : null,
        afterState: afterCourt ? courtAuditState(afterCourt) : courtAuditState(court),
        courtId: court.id
      },
      tx
    );

    return court;
  });
}

function resolveAdminVenueId(
  actor: Pick<UserProfileWithVenue, "role" | "venueId">,
  requestedVenueId?: string | null
): string | null {
  if (actor.role === "WALLY_ADMIN") {
    return requestedVenueId ?? null;
  }

  if (actor.role === "VENUE_ADMIN" && actor.venueId) {
    if (requestedVenueId && requestedVenueId !== actor.venueId) {
      throw new Error("No tienes permiso para administrar ese venue.");
    }

    return actor.venueId;
  }

  throw new Error("No tienes permiso para administrar canchas.");
}

function courtAuditState(
  court: Pick<Court, "id" | "venueId" | "name" | "description" | "isActive" | "displayOrder"> & {
    courtSports?: Array<{ sportId: string; isActive: boolean }>;
  }
): Prisma.InputJsonObject {
  return {
    id: court.id,
    venueId: court.venueId,
    name: court.name,
    description: court.description,
    isActive: court.isActive,
    displayOrder: court.displayOrder,
    sportIds: court.courtSports?.filter((item) => item.isActive).map((item) => item.sportId) ?? []
  };
}
