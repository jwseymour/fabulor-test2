/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Story` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoryShareGroup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StoryShareUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_createdById_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Story" DROP CONSTRAINT "Story_authorId_fkey";

-- DropForeignKey
ALTER TABLE "StoryShareGroup" DROP CONSTRAINT "StoryShareGroup_groupId_fkey";

-- DropForeignKey
ALTER TABLE "StoryShareGroup" DROP CONSTRAINT "StoryShareGroup_storyId_fkey";

-- DropForeignKey
ALTER TABLE "StoryShareUser" DROP CONSTRAINT "StoryShareUser_storyId_fkey";

-- DropForeignKey
ALTER TABLE "StoryShareUser" DROP CONSTRAINT "StoryShareUser_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupMember";

-- DropTable
DROP TABLE "Story";

-- DropTable
DROP TABLE "StoryShareGroup";

-- DropTable
DROP TABLE "StoryShareUser";
