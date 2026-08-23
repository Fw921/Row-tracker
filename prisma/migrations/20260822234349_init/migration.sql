-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('MANUAL', 'CONCEPT2_CSV');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('SINGLE_DISTANCE', 'SINGLE_TIME', 'INTERVALS', 'STEADY_STATE', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "WorkoutType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "totalDistanceMeters" DOUBLE PRECISION NOT NULL,
    "totalTimeSeconds" DOUBLE PRECISION NOT NULL,
    "avgSplitSeconds500m" DOUBLE PRECISION NOT NULL,
    "avgWatts" DOUBLE PRECISION,
    "avgHeartRate" INTEGER,
    "maxHeartRate" INTEGER,
    "avgStrokeRate" DOUBLE PRECISION,
    "dragFactor" INTEGER,
    "calories" DOUBLE PRECISION,
    "source" "DataSource" NOT NULL DEFAULT 'MANUAL',
    "importBatchId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "splits" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "distanceMeters" DOUBLE PRECISION NOT NULL,
    "timeSeconds" DOUBLE PRECISION NOT NULL,
    "splitSeconds500m" DOUBLE PRECISION NOT NULL,
    "restTimeSeconds" DOUBLE PRECISION,
    "restDistanceMeters" DOUBLE PRECISION,
    "avgWatts" DOUBLE PRECISION,
    "avgHeartRate" INTEGER,
    "avgStrokeRate" DOUBLE PRECISION,

    CONSTRAINT "splits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "DataSource" NOT NULL,
    "filename" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "workouts_userId_date_idx" ON "workouts"("userId", "date");

-- CreateIndex
CREATE INDEX "workouts_userId_type_idx" ON "workouts"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "splits_workoutId_index_key" ON "splits"("workoutId", "index");

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "splits" ADD CONSTRAINT "splits_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
