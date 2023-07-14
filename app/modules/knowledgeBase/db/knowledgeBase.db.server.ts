import { KnowledgeBase } from "@prisma/client";
import { db } from "~/lib/db.server";

export type KnowledgeBaseWithDetails = KnowledgeBase & {
  _count: {
    categories: number;
    articles: number;
    views: number;
  };
};

const include = {
  _count: {
    select: { categories: true, articles: true, views: true },
  },

  
};

export async function getAllKnowledgeBases({ enabled, orgUuid }: { enabled?: boolean, orgUuid?: string } = {}): Promise<KnowledgeBaseWithDetails[]> {
  return await db.knowledgeBase.findMany({
    where: { enabled, orgUuid, isDeleted: false },
    include
  });
}

export async function getKnowledgeBaseById(id: string, orgUuid: string): Promise<KnowledgeBaseWithDetails | null> {
  return await db.knowledgeBase.findFirst({
    where: { id, isDeleted: false, orgUuid },
    include,
  });
}

export async function getKnowledgeBaseBySlug(slug: string, orgUuid: string): Promise<KnowledgeBaseWithDetails | null> {
  return await db.knowledgeBase.findFirst({
    where: { slug, orgUuid, isDeleted: false },
    include,
  });
}

export async function createKnowledgeBase(data: {
  uuid: string;
  orgUuid: string;
  slug: string;
  title: string;
  description: string;
  defaultLanguage: string;
  layout: string;
  color: number;
  enabled: boolean;
  languages: string;
  links: string;
  logo: string;
  seoImage: string;
}) {
  return await db.knowledgeBase.create({
    data: {
      uuid: data.uuid,
      orgUuid: data.orgUuid,
      slug: data.slug,
      title: data.title,
      description: data.description,
      defaultLanguage: data.defaultLanguage,
      layout: data.layout,
      color: data.color,
      enabled: data.enabled,
      languages: data.languages,
      links: data.links,
      logo: data.logo,
      seoImage: data.seoImage,
    },
  });
}

export async function updateKnowledgeBase(
  id: string,
  data: {
    slug?: string;
    title?: string;
    description?: string;
    defaultLanguage?: string;
    layout?: string;
    color?: number;
    enabled?: boolean;
    languages?: string;
    links?: string;
    logo?: string;
    seoImage?: string;
  }
) {
  return await db.knowledgeBase.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      description: data.description,
      defaultLanguage: data.defaultLanguage,
      layout: data.layout,
      color: data.color,
      enabled: data.enabled,
      languages: data.languages,
      links: data.links,
      logo: data.logo,
      seoImage: data.seoImage,
    },
  });
}

export async function deleteKnowledgeBase(id: string) {
  return await db.knowledgeBase.delete({
    where: { id },
  });
}

export async function countKnowledgeBases(orgUuid: string) {
  return await db.knowledgeBase.count({
    where: { orgUuid }
  });
}
