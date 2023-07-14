import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import { v4 as uuidv4 } from "uuid";
import KbCategoryForm from "~/modules/knowledgeBase/components/bases/KbCategoryForm";
import { createKnowledgeBaseCategory, getAllKnowledgeBaseCategories, getKbCategoryBySlug } from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { authenticateClientV2 } from "~/modules/knowledgeBase/service/CoreService";
import KnowledgeBasePermissionsService from "~/modules/knowledgeBase/service/KnowledgeBasePermissionsService";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
};
export let loader = async ({ params, context, request }: LoaderArgs) => {
  await authenticateClientV2({request, context, params});
  const orgUuid = context['org_uuid'] as string;

  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    orgUuid
  });
  const data: LoaderData = {
    knowledgeBase,
  };
  return json(data);
};

export const action = async ({ request, params, context }: ActionArgs) => {
  await authenticateClientV2({request, context, params});
  const orgUuid = context['org_uuid'] as string;

  const form = await request.formData();
  const action = form.get("action")?.toString();
  await KnowledgeBasePermissionsService.hasPermission({ action });

  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    orgUuid
  });

  if (action === "new") {
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";

    const allCategories = await getAllKnowledgeBaseCategories({
      knowledgeBaseSlug: params.slug!,
      language: params.lang!,
      orgUuid
    });
    let maxOrder = 0;
    if (allCategories.length > 0) {
      maxOrder = Math.max(...allCategories.map((i) => i.order));
    }

    const existing = await getKbCategoryBySlug({
      knowledgeBaseId: knowledgeBase.id,
      slug,
      language: params.lang!,
    });
    if (existing) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }

    try {
      await createKnowledgeBaseCategory({
        knowledgeBaseId: knowledgeBase.id,
        uuid: uuidv4(),
        slug,
        title,
        description,
        icon,
        language: params.lang!,
        seoImage,
        order: maxOrder + 1,
      });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }

    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const data = useTypedLoaderData<LoaderData>();
  const params = useParams();

  return (
    <div>
      <KbCategoryForm knowledgeBase={data.knowledgeBase} language={params.lang!} />
    </div>
  );
}
