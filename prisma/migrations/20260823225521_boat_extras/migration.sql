-- CreateEnum
CREATE TYPE "RowingSide" AS ENUM ('PORT', 'STARBOARD', 'EITHER');

-- AlterTable
ALTER TABLE "athletes" ADD COLUMN     "side" "RowingSide";

-- AlterTable
ALTER TABLE "boat_seats" ADD COLUMN     "guestName" TEXT;
