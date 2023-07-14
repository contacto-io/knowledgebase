import {
  type LinksFunction,
  type LoaderArgs,
  type V2_MetaFunction,
} from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { useTypedLoaderData } from "remix-typedjson";
import stylesheet from "~/tailwind.css";
import { loadRootData, useRootData } from "./utils/data/root-data";
import { useEffect } from "react";
import Cookies from "universal-cookie";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];
export const meta: V2_MetaFunction = ({ data }) => data?.metatags;

export let loader = async ({ request }: LoaderArgs) => {
  return loadRootData({ request });
};

export default function App() {
  const rootData = useRootData();
  const data = useTypedLoaderData<{ debug: boolean }>();

  useEffect(() => {
    window.parent.postMessage({ pageLoaded: true }, "*");
    window.addEventListener("message", setAuth);
    return () => {
      window.addEventListener("message", setAuth);
    };
  }, []);

  const setAuth = (e: { data: any; }) => {
    const eventData = JSON.parse(JSON.stringify(e.data))
    if (eventData.authToken) {
    console.log('POSTMESSAGE RECIEVED: ', eventData)

      const cookies = new Cookies();
      cookies.set(
        "xAuth",{
          AOM_UUID: eventData.AOM_UUID,
          session_id: eventData.session_id,
          autToken: eventData.authToken,
        },
        { path: "/" }
      );
    }
  };

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/android-icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="96x96"
          href="/favicon-96x96.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-800">
        {!data.debug && (
          <>
            <script
              async
              defer
              src="https://scripts.simpleanalyticscdn.com/latest.js"
            ></script>
            <noscript>
              <img
                src="https://queue.simpleanalyticscdn.com/noscript.gif"
                alt="privacy-friendly-simpleanalytics"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </noscript>
          </>
        )}

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
