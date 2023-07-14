import { KnowledgeBaseCategorySection } from "@prisma/client";
import { db } from "~/lib/db.server";

export type KnowledgeBaseCategorySectionWithDetails = KnowledgeBaseCategorySection & {
  articles: {
    id: string;
    order: number;
    title: string;
  }[];
};

export async function getAllKnowledgeBaseCategorySections(orgUuid: string): Promise<KnowledgeBaseCategorySectionWithDetails[]> {
  return await db.knowledgeBaseCategorySection.findMany({
    where: {
      category: { 
        knowledgeBase: { orgUuid, isDeleted: false },
        isDeleted: false,
      },
      isDeleted: false,
    },
    include: {
      articles: { select: { id: true, order: true, title: true } },
    },
  });
}

export async function getKbCategorySectionById(id: string): Promise<KnowledgeBaseCategorySectionWithDetails | null> {
  return await db.knowledgeBaseCategorySection.findFirst({
    where: { id, isDeleted: false },
    include: {
      articles: { select: { id: true, order: true, title: true } },
    },
  });
}

export async function createKnowledgeBaseCategorySection(data: { categoryId: string; order: number; title: string; description: string, uuid: string }) {
  return await db.knowledgeBaseCategorySection.create({
    data: {
      uuid: data.uuid,
      categoryId: data.categoryId,
      order: data.order,
      title: data.title,
      description: data.description,
    },
  });
}

export async function updateKnowledgeBaseCategorySection(
  id: string,
  data: {
    order?: number;
    title?: string;
    description?: string;
  }
) {
  return await db.knowledgeBaseCategorySection.update({
    where: { id },
    data: {
      order: data.order,
      title: data.title,
      description: data.description,
    },
  });
}

export async function deleteKnowledgeBaseCategorySection(id: string) {
  return await db.knowledgeBaseCategorySection.update({
    where: { id },
    data: { isDeleted: true },
  });
}
