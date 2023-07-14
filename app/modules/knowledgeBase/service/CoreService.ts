import { LoaderArgs } from "@remix-run/node"
import { encode } from "base-64";

const testFunc = (request: any, context: any) => {
    request.headers.set("client-type", "admin_app");
    request.headers.set("Authorization", "Bearer wiwOjHsiZW1haWwiOiAiYXNoaXNoLnJhaSsxQHBsaXZvLmNvbSIsICJ0b2tlbl92ZXJzaW9uIjogMiwgImRhdGVfZ2VuZXJhdGVkIjogMTY4OTE3NjM5MX0=");
    request.headers.set("aom_uuid", "1d74ffe3-c49a-41d1-8858-ef7a1c967eed");
    request.headers.set("app-id", "8f641a5e-8c92-49ad-a80d-6248dfa06635");
    request.headers.set("browser-session-id", "f4758f17-ef68-4531-ace6-35513792ab30");
}

export const authenticateClientV2 = async ({ request, context }: LoaderArgs) => {
    testFunc(request, context);
    const username = process.env.CORE_SERVICE_USERNAME;
    const password = process.env.CORE_SERVICE_PASSWORD;
    const basicCredentials = encode(`${username}:${password}`);
    const clientType = request.headers.get("client-type");

    let token = null;
    const bearerToken = request.headers.get("Authorization") || null;
    if (bearerToken != null || bearerToken != "") {
        token = bearerToken?.split("Bearer ")[1];
    }

    let headers: any = {
        "Client-Type": clientType,
        "AOM_UUID": request.headers.get("aom_uuid"),
        "AUTH_TOKEN": token,
        "APP-ID": request.headers.get("app-id"),
        "Authorization": `Basic ${basicCredentials}`
    }

    if (clientType == "admin_app") {
        headers["Browser-Session-Id"] = request.headers.get("browser-session-id")
    }
    else {
        headers["client_version"] = request.headers.get("client_version")
    }

    let baseUrl = process.env.CORE_SERVICE_BASE_URL
    const resp = await fetch(`${baseUrl}/v2/misc/token-authenticator`,
        {
            method: 'GET',
            headers: headers
        });
    const data = await resp.json();

    if (data.errors != null) {
        throw new Error(data.errors['global_error'] || "Unable to authenticate");
    }
    else {
        context['org_uuid'] = data.data['org_uuid'];
        return data.data;
    }
}
