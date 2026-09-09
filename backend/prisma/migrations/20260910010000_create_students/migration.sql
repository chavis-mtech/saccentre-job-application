CREATE TABLE "students" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "nickname" VARCHAR(50) NOT NULL,
    "birth_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "students_last_name_first_name_idx"
ON "students"("last_name", "first_name");

CREATE INDEX "students_nickname_idx" ON "students"("nickname");
