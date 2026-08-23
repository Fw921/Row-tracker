-- AlterTable
ALTER TABLE "workouts" ADD COLUMN     "athleteId" TEXT,
ADD COLUMN     "pieceGroupId" TEXT;

-- CreateTable
CREATE TABLE "athletes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "athletes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "piece_groups" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "title" TEXT,
    "targetDistanceMeters" DOUBLE PRECISION,
    "targetTimeSeconds" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "piece_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "athletes_userId_name_key" ON "athletes"("userId", "name");

-- CreateIndex
CREATE INDEX "piece_groups_userId_date_idx" ON "piece_groups"("userId", "date");

-- CreateIndex
CREATE INDEX "workouts_athleteId_date_idx" ON "workouts"("athleteId", "date");

-- CreateIndex
CREATE INDEX "workouts_pieceGroupId_idx" ON "workouts"("pieceGroupId");

-- AddForeignKey
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "piece_groups" ADD CONSTRAINT "piece_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "athletes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_pieceGroupId_fkey" FOREIGN KEY ("pieceGroupId") REFERENCES "piece_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
