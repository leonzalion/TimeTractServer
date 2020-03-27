# Migration `20200326184008-optional`

This migration has been generated by Leon Si at 3/26/2020, 6:40:08 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
    "accessToken" text   ,
    "avatarUrl" text   ,
    "id" SERIAL,
    "password" text  NOT NULL DEFAULT '',
    "rescueTimeData" integer   ,
    "username" text  NOT NULL DEFAULT '',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."RescueTimeData" (
    "distractingTime" integer  NOT NULL DEFAULT 0,
    "id" SERIAL,
    "productiveTime" integer  NOT NULL DEFAULT 0,
    "updatedAt" timestamp(3)  NOT NULL DEFAULT '1970-01-01 00:00:00',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."Group" (
    "blurb" text  NOT NULL DEFAULT '',
    "description" text  NOT NULL DEFAULT '',
    "id" SERIAL,
    "leader" integer  NOT NULL ,
    "name" text  NOT NULL DEFAULT '',
    PRIMARY KEY ("id")
) 

CREATE TABLE "public"."_GroupMembers" (
    "A" integer  NOT NULL ,
    "B" integer  NOT NULL 
) 

CREATE UNIQUE INDEX "User.username" ON "public"."User"("username")

CREATE UNIQUE INDEX "Group.name" ON "public"."Group"("name")

CREATE UNIQUE INDEX "Group_leader" ON "public"."Group"("leader")

CREATE UNIQUE INDEX "_GroupMembers_AB_unique" ON "public"."_GroupMembers"("A","B")

CREATE  INDEX "_GroupMembers_B_index" ON "public"."_GroupMembers"("B")

ALTER TABLE "public"."User" ADD FOREIGN KEY ("rescueTimeData")REFERENCES "public"."RescueTimeData"("id") ON DELETE SET NULL  ON UPDATE CASCADE

ALTER TABLE "public"."Group" ADD FOREIGN KEY ("leader")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."_GroupMembers" ADD FOREIGN KEY ("A")REFERENCES "public"."Group"("id") ON DELETE CASCADE  ON UPDATE CASCADE

ALTER TABLE "public"."_GroupMembers" ADD FOREIGN KEY ("B")REFERENCES "public"."User"("id") ON DELETE CASCADE  ON UPDATE CASCADE
```

## Changes

```diff
diff --git schema.prisma schema.prisma
migration ..20200326184008-optional
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,35 @@
+generator client {
+  provider = "prisma-client-js"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = env("DATABASE_URL")
+}
+
+model User {
+  id Int @id @default(autoincrement())
+  username String @unique
+  password String
+  accessToken String?
+  rescueTimeData RescueTimeData?
+  groups Group[] @relation("GroupMembers")
+  avatarUrl String?
+  leaderOf Group? @relation("GroupLeader")
+}
+
+model RescueTimeData {
+  id Int @id @default(autoincrement())
+  productiveTime Int
+  distractingTime Int
+  updatedAt DateTime @updatedAt
+}
+
+model Group {
+  id Int @id @default(autoincrement())
+  name String @unique
+  blurb String @default("")
+  description String @default("")
+  leader User @relation("GroupLeader")
+  members User[] @relation("GroupMembers")
+}
```

