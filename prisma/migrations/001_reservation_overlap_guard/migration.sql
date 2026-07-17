-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- Enable GiST equality support for UUID values used by the reservation overlap guard.
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLAYER', 'VENUE_ADMIN', 'WALLY_ADMIN');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER_PROFILE', 'COURT', 'SPORT', 'SCHEDULE_RULE', 'AVAILABILITY_OVERRIDE', 'RESERVATION', 'PAYMENT');

-- CreateEnum
CREATE TYPE "AvailabilityOverrideType" AS ENUM ('BLOCKED', 'CLOSED_DAY', 'OPEN_EXTRA');

-- CreateEnum
CREATE TYPE "PaymentSource" AS ENUM ('MANUAL', 'EVENT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PaymentEventStatus" AS ENUM ('RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditSource" AS ENUM ('USER', 'PAYMENT_EVENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "Venue" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/La_Paz',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "authUserId" UUID NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "venueId" UUID,
    "displayName" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Court" (
    "id" UUID NOT NULL,
    "venueId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Court_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sport" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Sport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourtSport" (
    "courtId" UUID NOT NULL,
    "sportId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CourtSport_pkey" PRIMARY KEY ("courtId","sportId")
);

-- CreateTable
CREATE TABLE "ScheduleRule" (
    "id" UUID NOT NULL,
    "courtId" UUID NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startLocalTime" TIME(0) NOT NULL,
    "endLocalTime" TIME(0) NOT NULL,
    "slotMinutes" INTEGER NOT NULL,
    "cancellationCutoffMinutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilityOverride" (
    "id" UUID NOT NULL,
    "courtId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "startLocalTime" TIME(0),
    "endLocalTime" TIME(0),
    "type" "AvailabilityOverrideType" NOT NULL,
    "reason" TEXT,
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" UUID NOT NULL,
    "playerId" UUID NOT NULL,
    "courtId" UUID NOT NULL,
    "sportId" UUID NOT NULL,
    "localDate" DATE NOT NULL,
    "startAtUtc" TIMESTAMP(3) NOT NULL,
    "endAtUtc" TIMESTAMP(3) NOT NULL,
    "startLocalTime" TIME(0) NOT NULL,
    "endLocalTime" TIME(0) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'CONFIRMED',
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "cancelledAt" TIMESTAMP(3),
    "cancelledByUserId" UUID,
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" UUID NOT NULL,
    "reservationId" UUID NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "amount" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'BOB',
    "source" "PaymentSource" NOT NULL,
    "sourceReference" TEXT,
    "reason" TEXT,
    "createdByUserId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentEvent" (
    "id" UUID NOT NULL,
    "source" TEXT NOT NULL,
    "sourceEventId" TEXT NOT NULL,
    "reservationId" UUID,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" "PaymentEventStatus" NOT NULL DEFAULT 'RECEIVED',
    "payloadSummary" JSONB NOT NULL,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditRecord" (
    "id" UUID NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actorUserId" UUID,
    "actorRole" "UserRole",
    "source" "AuditSource" NOT NULL,
    "beforeState" JSONB,
    "afterState" JSONB,
    "reason" TEXT,
    "requestId" TEXT,
    "reservationId" UUID,
    "paymentId" UUID,
    "courtId" UUID,
    "sportId" UUID,
    "scheduleRuleId" UUID,
    "availabilityOverrideId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Venue_name_key" ON "Venue"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_authUserId_key" ON "UserProfile"("authUserId");

-- CreateIndex
CREATE INDEX "UserProfile_role_venueId_idx" ON "UserProfile"("role", "venueId");

-- CreateIndex
CREATE INDEX "Court_venueId_isActive_displayOrder_idx" ON "Court"("venueId", "isActive", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Court_venueId_name_key" ON "Court"("venueId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Court_venueId_displayOrder_key" ON "Court"("venueId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Sport_code_key" ON "Sport"("code");

-- CreateIndex
CREATE INDEX "Sport_isActive_idx" ON "Sport"("isActive");

-- CreateIndex
CREATE INDEX "CourtSport_sportId_isActive_idx" ON "CourtSport"("sportId", "isActive");

-- CreateIndex
CREATE INDEX "ScheduleRule_courtId_dayOfWeek_isActive_idx" ON "ScheduleRule"("courtId", "dayOfWeek", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleRule_courtId_dayOfWeek_startLocalTime_endLocalTime_key" ON "ScheduleRule"("courtId", "dayOfWeek", "startLocalTime", "endLocalTime");

-- CreateIndex
CREATE INDEX "AvailabilityOverride_courtId_localDate_type_idx" ON "AvailabilityOverride"("courtId", "localDate", "type");

-- CreateIndex
CREATE INDEX "AvailabilityOverride_createdByUserId_idx" ON "AvailabilityOverride"("createdByUserId");

-- CreateIndex
CREATE INDEX "Reservation_playerId_status_startAtUtc_idx" ON "Reservation"("playerId", "status", "startAtUtc");

-- CreateIndex
CREATE INDEX "Reservation_courtId_status_startAtUtc_endAtUtc_idx" ON "Reservation"("courtId", "status", "startAtUtc", "endAtUtc");

-- CreateIndex
CREATE INDEX "Reservation_courtId_localDate_startLocalTime_idx" ON "Reservation"("courtId", "localDate", "startLocalTime");

-- CreateIndex
CREATE INDEX "Reservation_sportId_localDate_idx" ON "Reservation"("sportId", "localDate");

-- CreateIndex
CREATE INDEX "Reservation_paymentStatus_idx" ON "Reservation"("paymentStatus");

-- Prevent active reservations from overlapping on the same court.
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_no_active_overlap"
    EXCLUDE USING gist (
        "courtId" WITH =,
        tsrange("startAtUtc", "endAtUtc", '[)') WITH &&
    )
    WHERE ("status" = 'CONFIRMED'::"ReservationStatus");

-- CreateIndex
CREATE INDEX "Payment_reservationId_createdAt_idx" ON "Payment"("reservationId", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Payment_source_sourceReference_idx" ON "Payment"("source", "sourceReference");

-- CreateIndex
CREATE INDEX "PaymentEvent_reservationId_idx" ON "PaymentEvent"("reservationId");

-- CreateIndex
CREATE INDEX "PaymentEvent_status_receivedAt_idx" ON "PaymentEvent"("status", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_source_sourceEventId_key" ON "PaymentEvent"("source", "sourceEventId");

-- CreateIndex
CREATE INDEX "AuditRecord_entityType_entityId_createdAt_idx" ON "AuditRecord"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditRecord_actorUserId_createdAt_idx" ON "AuditRecord"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditRecord_reservationId_createdAt_idx" ON "AuditRecord"("reservationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditRecord_paymentId_createdAt_idx" ON "AuditRecord"("paymentId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditRecord_requestId_idx" ON "AuditRecord"("requestId");

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Court" ADD CONSTRAINT "Court_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtSport" ADD CONSTRAINT "CourtSport_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourtSport" ADD CONSTRAINT "CourtSport_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleRule" ADD CONSTRAINT "ScheduleRule_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityOverride" ADD CONSTRAINT "AvailabilityOverride_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilityOverride" ADD CONSTRAINT "AvailabilityOverride_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_cancelledByUserId_fkey" FOREIGN KEY ("cancelledByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentEvent" ADD CONSTRAINT "PaymentEvent_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_sportId_fkey" FOREIGN KEY ("sportId") REFERENCES "Sport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_scheduleRuleId_fkey" FOREIGN KEY ("scheduleRuleId") REFERENCES "ScheduleRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditRecord" ADD CONSTRAINT "AuditRecord_availabilityOverrideId_fkey" FOREIGN KEY ("availabilityOverrideId") REFERENCES "AvailabilityOverride"("id") ON DELETE SET NULL ON UPDATE CASCADE;
