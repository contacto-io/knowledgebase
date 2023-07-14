import { ActionArgs, json, redirect } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
import { useTypedActionData } from "remix-typedjson";
import { v4 as uuidv4 } from 'uuid';
import ActionResultModal from "~/components/ui/modals/ActionResultModal";
import KnowledgeBaseForm from "~/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import { createKnowledgeBase, getKnowledgeBaseBySlug } from "~/modules/knowledgeBase/db/knowledgeBase.db.server";
import { KbNavLinkDto } from "~/modules/knowledgeBase/dtos/KbNavLinkDto";
import { authenticateClientV2 } from "~/modules/knowledgeBase/service/CoreService";
import KnowledgeBasePermissionsService from "~/modules/knowledgeBase/service/KnowledgeBasePermissionsService";

type ActionData = {
  error?: string;
  success?: string;
};
export const action = async ({ request, params, context }: ActionArgs) => {
  await authenticateClientV2({request, context, params});
  const orgUuid = context['org_uuid'] as string;

  const form = await request.formData();
  const action = form.get("action")?.toString();
  await KnowledgeBasePermissionsService.hasPermission({ action });
  if (action === "new") {
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const defaultLanguage = form.get("defaultLanguage")?.toString() ?? "";
    const layout = form.get("layout")?.toString() ?? "";
    const color = Number(form.get("color")?.toString() ?? "");
    const enabled = Boolean(form.get("enabled"));
    const languages = form.getAll("languages[]").map((l) => l.toString());
    const links: KbNavLinkDto[] = form.getAll("links[]").map((l) => JSON.parse(l.toString()));
    const logo = form.get("logo")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";

    if (languages.length === 0) {
      return json({ error: "At least one language is required" }, { status: 400 });
    }
    const existing = await getKnowledgeBaseBySlug(slug, orgUuid);
    if (existing) {
      return json({ error: "Slug already exists" }, { status: 400 });
    }
    
    const uuid = uuidv4();

    try {
      await createKnowledgeBase({
        uuid,
        orgUuid,
        slug,
        title,
        description,
        defaultLanguage,
        layout,
        color,
        enabled,
        languages: JSON.stringify(languages),
        links: JSON.stringify(links),
        logo,
        seoImage,
      });
    } catch (e: any) {
      return json({ error: e.message }, { status: 400 });
    }

    return redirect("/admin/knowledge-base/bases");
  } else {
    return json({ error: "Invalid form" }, { status: 400 });
  }
};

export default function () {
  const actionData = useTypedActionData<ActionData>();
  const submit = useSubmit();

  function onDelete() {
    const form = new FormData();
    form.set("action", "delete");
    submit(form, {
      method: "post",
    });
  }
  return (
    <div>
      <KnowledgeBaseForm onDelete={onDelete} />

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}
