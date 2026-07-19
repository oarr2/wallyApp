import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const venueSeed = {
  name: "Wally La Paz",
  timezone: "America/La_Paz"
};

const sportSeed = {
  code: "wally",
  name: "Wally"
};

const courtSeeds = [
  {
    name: "Cancha 1",
    description: "Cancha principal para reservas de wally.",
    displayOrder: 1
  },
  {
    name: "Cancha 2",
    description: "Cancha secundaria para reservas de wally.",
    displayOrder: 2
  }
];

const userSeeds = {
  player: {
    authUserId: "00000000-0000-4000-8000-000000000001",
    role: UserRole.PLAYER,
    displayName: "Jugador MVP",
    phone: "+59170000001"
  },
  venueAdmin: {
    authUserId: "00000000-0000-4000-8000-000000000002",
    role: UserRole.VENUE_ADMIN,
    displayName: "Administrador del Venue",
    phone: "+59170000002"
  },
  wallyAdmin: {
    authUserId: "00000000-0000-4000-8000-000000000003",
    role: UserRole.WALLY_ADMIN,
    displayName: "Administrador Wally",
    phone: "+59170000003"
  }
};

const defaultSchedule = {
  startLocalTime: time("08:00:00"),
  endLocalTime: time("22:00:00"),
  slotMinutes: 60,
  cancellationCutoffMinutes: 120,
  isActive: true
};

function time(value: string) {
  return new Date(`1970-01-01T${value}.000Z`);
}

async function main() {
  const venue = await prisma.venue.upsert({
    where: { name: venueSeed.name },
    update: { timezone: venueSeed.timezone },
    create: venueSeed
  });

  const sport = await prisma.sport.upsert({
    where: { code: sportSeed.code },
    update: {
      name: sportSeed.name,
      isActive: true
    },
    create: {
      ...sportSeed,
      isActive: true
    }
  });

  const courts = await Promise.all(
    courtSeeds.map((courtSeed) =>
      prisma.court.upsert({
        where: {
          venueId_name: {
            venueId: venue.id,
            name: courtSeed.name
          }
        },
        update: {
          description: courtSeed.description,
          displayOrder: courtSeed.displayOrder,
          isActive: true
        },
        create: {
          ...courtSeed,
          venueId: venue.id,
          isActive: true
        }
      })
    )
  );

  await Promise.all(
    courts.map((court) =>
      prisma.courtSport.upsert({
        where: {
          courtId_sportId: {
            courtId: court.id,
            sportId: sport.id
          }
        },
        update: { isActive: true },
        create: {
          courtId: court.id,
          sportId: sport.id,
          isActive: true
        }
      })
    )
  );

  await Promise.all(
    courts.flatMap((court) =>
      Array.from({ length: 7 }, (_, dayOfWeek) =>
        prisma.scheduleRule.upsert({
          where: {
            courtId_dayOfWeek_startLocalTime_endLocalTime: {
              courtId: court.id,
              dayOfWeek,
              startLocalTime: defaultSchedule.startLocalTime,
              endLocalTime: defaultSchedule.endLocalTime
            }
          },
          update: {
            slotMinutes: defaultSchedule.slotMinutes,
            cancellationCutoffMinutes:
              defaultSchedule.cancellationCutoffMinutes,
            isActive: defaultSchedule.isActive
          },
          create: {
            courtId: court.id,
            dayOfWeek,
            ...defaultSchedule
          }
        })
      )
    )
  );

  await prisma.userProfile.upsert({
    where: { authUserId: userSeeds.player.authUserId },
    update: {
      role: userSeeds.player.role,
      venueId: null,
      displayName: userSeeds.player.displayName,
      phone: userSeeds.player.phone
    },
    create: {
      ...userSeeds.player,
      venueId: null
    }
  });

  await prisma.userProfile.upsert({
    where: { authUserId: userSeeds.venueAdmin.authUserId },
    update: {
      role: userSeeds.venueAdmin.role,
      venueId: venue.id,
      displayName: userSeeds.venueAdmin.displayName,
      phone: userSeeds.venueAdmin.phone
    },
    create: {
      ...userSeeds.venueAdmin,
      venueId: venue.id
    }
  });

  await prisma.userProfile.upsert({
    where: { authUserId: userSeeds.wallyAdmin.authUserId },
    update: {
      role: userSeeds.wallyAdmin.role,
      venueId: null,
      displayName: userSeeds.wallyAdmin.displayName,
      phone: userSeeds.wallyAdmin.phone
    },
    create: {
      ...userSeeds.wallyAdmin,
      venueId: null
    }
  });

  console.log(
    "Seed MVP aplicado: 1 venue, 2 canchas, deporte wally, horarios y 3 perfiles."
  );
}

main()
  .catch((error) => {
    console.error("Error al ejecutar el seed MVP:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
