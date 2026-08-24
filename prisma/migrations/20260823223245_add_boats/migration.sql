-- CreateEnum
CREATE TYPE "BoatClass" AS ENUM ('EIGHT_PLUS', 'FOUR_PLUS', 'FOUR_MINUS', 'FOUR_X', 'PAIR', 'DOUBLE', 'SINGLE');

-- CreateTable
CREATE TABLE "boats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "boatClass" "BoatClass" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "boats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "boat_seats" (
    "id" TEXT NOT NULL,
    "boatId" TEXT NOT NULL,
    "seatIndex" INTEGER NOT NULL,
    "athleteId" TEXT,

    CONSTRAINT "boat_seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "boats_userId_idx" ON "boats"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "boat_seats_boatId_seatIndex_key" ON "boat_seats"("boatId", "seatIndex");

-- AddForeignKey
ALTER TABLE "boats" ADD CONSTRAINT "boats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_seats" ADD CONSTRAINT "boat_seats_boatId_fkey" FOREIGN KEY ("boatId") REFERENCES "boats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "boat_seats" ADD CONSTRAINT "boat_seats_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
