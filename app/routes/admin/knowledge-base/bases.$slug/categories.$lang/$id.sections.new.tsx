import { ActionArgs, LoaderArgs, json, redirect } from "@remix-run/node";
import { useParams } from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import { v4 as uuuidv4 } from "uuid";
import KbCategorySectionForm from "~/modules/knowledgeBase/components/bases/KbCategorySectionForm";
import { getKbCategoryById } from "~/modules/knowledgeBase/db/kbCategories.db.server";
import { createKnowledgeBaseCategorySection } from "~/modules/knowledgeBase/db/kbCategorySections.db.server";
import { KnowledgeBaseDto } from "~/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetails } from "~/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import { authenticateClientV2 } from "~/modules/knowledgeBase/service/CoreService";
import KnowledgeBasePermissionsService from "~/modules/knowledgeBase/service/KnowledgeBasePermissionsService";
import KnowledgeBaseService from "~/modules/knowledgeBase/service/KnowledgeBaseService";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetails;
};
export let loader = async ({ params, context, request }: LoaderArgs) => {
  await authenticateClientV2({request, context, params});
  const orgUuid = context['org_uuid'] as string;

  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    orgUuid
  });

  const category = await getKbCategoryById(params.id!);
  if (!category) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  const data: LoaderData = {
    knowledgeBase,
    category,
  };
  return json(data);
};

export const action = async ({ request, params, context }: ActionArgs) => {
  await authenticateClientV2({request, context, params});

  const form = await request.formData();
  const action = form.get("action")?.toString();
  await KnowledgeBasePermissionsService.hasPermission({ action });

  const category = await getKbCategoryById(params.id!);
  if (!category) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  if (action === "new") {
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";

    let maxOrder = 0;
    if (category.sections.length > 0) {
      maxOrder = Math.max(...category.sections.map((i) => i.order));
    }

    try {
      await createKnowledgeBaseCategorySection({
        categoryId: category.id,
        uuid: uuuidv4(),
        order: maxOrder + 1,
        title,
        description,
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
      <KbCategorySectionForm knowledgeBase={data.knowledgeBase} category={data.category} language={params.lang!} />
    </div>
  );
}
