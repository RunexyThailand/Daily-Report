-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "public"."Report" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "project_id" TEXT,
    "task_id" TEXT,
    "report_date" DATE NOT NULL,
    "progress" INTEGER,
    "due_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Report_trans" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "lang" TEXT,
    "title" TEXT,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Report_trans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."Comment" (
    "id" TEXT NOT NULL,
    "report_id" TEXT NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "updated_at" TIMESTAMP(3),
    "updated_by" TEXT,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- CREATE TABLE "public"."Account" (
--     "id" TEXT NOT NULL,
--     "userId" TEXT NOT NULL,
--     "type" TEXT NOT NULL,
--     "provider" TEXT NOT NULL,
--     "providerAccountId" TEXT NOT NULL,
--     "refresh_token" TEXT,
--     "access_token" TEXT,
--     "expires_at" INTEGER,
--     "token_type" TEXT,
--     "scope" TEXT,
--     "id_token" TEXT,
--     "session_state" TEXT,

--     CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
-- );

-- CreateTable
-- CREATE TABLE "public"."Session" (
--     "id" TEXT NOT NULL,
--     "sessionToken" TEXT NOT NULL,
--     "userId" TEXT NOT NULL,
--     "expires" TIMESTAMP(3) NOT NULL,

--     CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "public"."VerificationToken" (
--     "identifier" TEXT NOT NULL,
--     "token" TEXT NOT NULL,
--     "expires" TIMESTAMP(3) NOT NULL
-- );

-- -- CreateTable
-- CREATE TABLE "public"."Post" (
--     "id" TEXT NOT NULL,
--     "title" TEXT NOT NULL,
--     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

--     CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
-- );

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
-- CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "public"."Account"("provider", "providerAccountId");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "Session_sessionToken_key" ON "public"."Session"("sessionToken");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "VerificationToken_token_key" ON "public"."VerificationToken"("token");

-- -- CreateIndex
-- CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "public"."VerificationToken"("identifier", "token");

-- -- AddForeignKey
-- ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
