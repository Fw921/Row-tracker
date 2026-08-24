-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('SPLIT_TARGET', 'TOTAL_METERS', 'MONTHLY_WORKOUTS');

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "label" TEXT,
    "targetDistanceMeters" DOUBLE PRECISION,
    "targetSplitSeconds500m" DOUBLE PRECISION,
    "targetMeters" DOUBLE PRECISION,
    "targetWorkoutsPerMonth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goals_userId_idx" ON "goals"("userId");

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
