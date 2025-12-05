-- CreateTable
CREATE TABLE "influencers" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "imageUrl" TEXT,
    "gender" TEXT,
    "age" INTEGER,
    "location" TEXT,
    "hairColor" TEXT,
    "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "settings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "additionalInfo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "clothingStyles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feedPosts" INTEGER NOT NULL DEFAULT 0,
    "storyPosts" INTEGER NOT NULL DEFAULT 0,
    "video5s" INTEGER NOT NULL DEFAULT 0,
    "video8s" INTEGER NOT NULL DEFAULT 0,
    "captionVideo" BOOLEAN NOT NULL DEFAULT false,
    "trendsVideos" INTEGER NOT NULL DEFAULT 0,
    "multiAngle" INTEGER NOT NULL DEFAULT 0,
    "pauseChallenge" INTEGER NOT NULL DEFAULT 0,
    "outfitChanger" INTEGER NOT NULL DEFAULT 0,
    "beforeAfter" INTEGER NOT NULL DEFAULT 0,
    "dailyContentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "trainingProgress" INTEGER NOT NULL DEFAULT 0,
    "imagesLocked" INTEGER NOT NULL DEFAULT 0,
    "stylesChosen" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "influencers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content" (
    "id" SERIAL NOT NULL,
    "influencerId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "style" TEXT,
    "prompt" TEXT,
    "aspectRatio" TEXT,
    "quality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_influencerId_idx" ON "content"("influencerId");

-- CreateIndex
CREATE INDEX "content_type_idx" ON "content"("type");

-- AddForeignKey
ALTER TABLE "content" ADD CONSTRAINT "content_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "influencers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
