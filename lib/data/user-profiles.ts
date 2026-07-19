import { UserRole, type Prisma, type UserProfile } from "@prisma/client";
import prisma from "@/lib/data/prisma";

export type UserProfileWithVenue = UserProfile & {
  venue: { id: string; name: string; timezone: string } | null;
};

export type UserProfileClient = Pick<
  Prisma.TransactionClient,
  "userProfile" | "venue"
>;

const userProfileInclude = {
  venue: {
    select: {
      id: true,
      name: true,
      timezone: true
    }
  }
} satisfies Prisma.UserProfileInclude;

export async function getUserProfileByAuthUserId(
  authUserId: string,
  client: UserProfileClient = prisma
): Promise<UserProfileWithVenue | null> {
  return client.userProfile.findUnique({
    where: { authUserId },
    include: userProfileInclude
  });
}

export async function getUserProfileById(
  id: string,
  client: UserProfileClient = prisma
): Promise<UserProfileWithVenue | null> {
  return client.userProfile.findUnique({
    where: { id },
    include: userProfileInclude
  });
}

export async function createPlayerProfileForAuthUser(
  input: {
    authUserId: string;
    displayName: string;
    phone?: string | null;
  },
  client: UserProfileClient = prisma
): Promise<UserProfileWithVenue> {
  return client.userProfile.create({
    data: {
      authUserId: input.authUserId,
      displayName: input.displayName,
      phone: input.phone ?? null,
      role: UserRole.PLAYER,
      venueId: null
    },
    include: userProfileInclude
  });
}

export async function getOrCreatePlayerProfileForAuthUser(
  input: {
    authUserId: string;
    displayName: string;
    phone?: string | null;
  },
  client: UserProfileClient = prisma
): Promise<UserProfileWithVenue> {
  const existingProfile = await getUserProfileByAuthUserId(
    input.authUserId,
    client
  );

  if (existingProfile) {
    return existingProfile;
  }

  return createPlayerProfileForAuthUser(input, client);
}

export async function listVenueAdminProfiles(
  venueId: string,
  client: UserProfileClient = prisma
): Promise<UserProfileWithVenue[]> {
  return client.userProfile.findMany({
    where: {
      role: UserRole.VENUE_ADMIN,
      venueId
    },
    include: userProfileInclude,
    orderBy: { displayName: "asc" }
  });
}
