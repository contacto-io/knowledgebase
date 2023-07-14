import { KnowledgeBaseArticle, Prisma } from "@prisma/client";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { db } from "~/lib/db.server";

export type KnowledgeBaseArticleWithDetails = KnowledgeBaseArticle & {
  category: { slug: string; title: string } | null;
  section: { order: number; title: string } | null;
  relatedArticles: { order: number; title: string; slug: string }[];
  _count: {
    views: number;
    upvotes: number;
    downvotes: number;
  };
};

const include = {
  category: {
    select: { slug: true, title: true },
  },
  section: {
    select: { order: true, title: true },
  },
  relatedArticles: {
    select: { order: true, title: true, slug: true },
  },
  _count: {
    select: { views: true, upvotes: true, downvotes: true },
  },
};

export async function getAllKnowledgeBaseArticles({
  knowledgeBaseSlug,
  categoryId,
  language,
  orgUuid
}: {
  knowledgeBaseSlug: string;
  categoryId?: string;
  language: string | undefined;
  orgUuid: string;
}): Promise<KnowledgeBaseArticleWithDetails[]> {
  return await db.knowledgeBaseArticle.findMany({
    where: {
      knowledgeBase: { slug: knowledgeBaseSlug, orgUuid, isDeleted: false },
      // category: { isDeleted: false },
      categoryId,
      language,
      isDeleted: false,
    },
    include,
    orderBy: [
      {
        category: { order: "asc" },
      },
      {
        section: { order: "asc" },
      },
      {
        order: "asc",
      },
    ],
  });
}

export async function getAllKnowledgeBaseArticlesWithPagination({
  knowledgeBaseSlug,
  orgUuid,
  language,
  pagination,
  filters,
}: {
  knowledgeBaseSlug: string;
  orgUuid: string;
  language: string | undefined;
  pagination: {
    page: number;
    pageSize: number;
  };
  filters: {
    title?: string;
    description?: string;
    categoryId?: string | null;
  };
}): Promise<{
  items: KnowledgeBaseArticleWithDetails[];
  pagination: PaginationDto;
}> {
  const where: Prisma.KnowledgeBaseArticleWhereInput = {
    knowledgeBase: { slug: knowledgeBaseSlug, orgUuid },
    language,
    isDeleted: false,
  };
  if (filters.title !== undefined) {
    where.title = { contains: filters.title };
  }
  if (filters.description !== undefined) {
    where.description = { contains: filters.description };
  }
  if (filters.categoryId !== undefined) {
    where.categoryId = filters.categoryId;
  }
  const items = await db.knowledgeBaseArticle.findMany({
    take: pagination.pageSize,
    skip: (pagination.page - 1) * pagination.pageSize,
    where,
    include,
    orderBy: [{ createdAt: "desc" }],
  });
  const totalItems = await db.knowledgeBaseArticle.count({
    where,
  });
  return {
    items,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pagination.pageSize),
    },
  };
}

export async function getFeaturedKnowledgeBaseArticles({
  knowledgeBaseId,
  language,
}: {
  knowledgeBaseId: string;
  language: string;
}): Promise<KnowledgeBaseArticleWithDetails[]> {
  return await db.knowledgeBaseArticle.findMany({
    where: {
      knowledgeBaseId,
      language,
      featuredOrder: { not: null },
      publishedAt: { not: null },
    },
    include,
    orderBy: [{ featuredOrder: "asc" }],
  });
}

export async function getKbArticleById(id: string): Promise<KnowledgeBaseArticleWithDetails | null> {
  return await db.knowledgeBaseArticle.findFirst({
    where: { id, isDeleted: false },
    include,
  });
}

export async function getKbArticleBySlug({
  knowledgeBaseId,
  orgUuid,
  slug,
  language,
}: {
  knowledgeBaseId: string;
  orgUuid: string;
  slug: string;
  language: string;
}): Promise<KnowledgeBaseArticleWithDetails | null> {
  return await db.knowledgeBaseArticle.findFirst({
    where: {
      knowledgeBaseId,
      knowledgeBase: { orgUuid, isDeleted: false },
      slug,
      language,
      isDeleted: false,
    },
    include: {
      ...include,
    },
  });
}

export async function createKnowledgeBaseArticle(data: {
  uuid: string;
  createdBy: string;
  knowledgeBaseId: string;
  categoryId: string | null;
  sectionId: string | null;
  slug: string;
  title: string;
  description: string;
  order: number;
  contentDraft: string;
  contentPublished: string;
  contentType: string;
  language: string;
  featuredOrder: number | null;
  author: string;
  seoImage: string;
  publishedAt: Date | null;
}) {
  return await db.knowledgeBaseArticle.create({
    data: {
      uuid: data.uuid,
      createdBy: data.createdBy,
      updatedBy: data.createdBy,
      publishStatus: "draft",
      knowledgeBaseId: data.knowledgeBaseId,
      categoryId: data.categoryId,
      sectionId: data.sectionId,
      slug: data.slug,
      title: data.title,
      description: data.description,
      order: data.order,
      contentDraft: data.contentDraft,
      contentPublished: data.contentPublished,
      contentType: data.contentType,
      language: data.language,
      featuredOrder: data.featuredOrder,
      author: data.author,
      seoImage: data.seoImage,
      publishedAt: data.publishedAt,
    },
  });
}

export async function updateKnowledgeBaseArticle(
  id: string,
  data: {
    updatedBy: string;
    publishStatus?: string;
    categoryId?: string | null;
    sectionId?: string | null;
    slug?: string;
    title?: string;
    description?: string;
    order?: number;
    contentDraft?: string;
    contentPublished?: string;
    contentType?: string;
    language?: string;
    featuredOrder?: number | null;
    author?: string;
    seoImage?: string;
    publishedAt?: Date | null;
  }
) {
  return await db.knowledgeBaseArticle.update({
    where: { id },
    data: {
      updatedBy: data.updatedBy,
      publishStatus: data.publishStatus,
      categoryId: data.categoryId,
      sectionId: data.sectionId,
      slug: data.slug,
      title: data.title,
      description: data.description,
      order: data.order,
      contentDraft: data.contentDraft,
      contentPublished: data.contentPublished,
      contentType: data.contentType,
      language: data.language,
      featuredOrder: data.featuredOrder,
      author: data.author,
      seoImage: data.seoImage,
      publishedAt: data.publishedAt,
    },
  });
}

export async function deleteKnowledgeBaseArticle(id: string, updatedBy: string) {
  return await db.knowledgeBaseArticle.update({
    where: { id },
    data: { isDeleted: true, updatedBy }
  });
}

export async function countKnowledgeBaseArticles(orgUuid: string) {
  return await db.knowledgeBaseArticle.count({
    where: {
      knowledgeBase: { isDeleted: false, orgUuid }
    }
  });
}
