import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  useCatch,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";

import globalStylesUrl from "./styles/global.css";
import globalMediumStylesUrl from "./styles/global-medium.css";
import globalLargeStylesUrl from "./styles/global-large.css";
import { ReactNode } from "react";

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: globalStylesUrl,
    },
    {
      rel: "stylesheet",
      href: globalMediumStylesUrl,
      media: "print, (min-width: 640px)",
    },
    {
      rel: "stylesheet",
      href: globalLargeStylesUrl,
      media: "screen and (min-width: 1024px)",
    },
  ];
};

export const meta: MetaFunction = () => {
  const description = "Tutorial remix project";
  return {
    charSet: "utf-8",
    description,
    keywords: "Remix,jokes",
    "twitter:image": "https://remix-jokes.lol/social.png",
    "twitter:card": "summary-large-image",
    "twitter:creator": "dk",
    "twitter:site": "@dk",
    "twitter:title": "Remix Jokes Tutorial",
    "twitter:description": description,
  };
};

export default function App() {
  return (
    <Document>
      <Outlet />
    </Document>
  );
}

function Document({
  children,
  title = "Remix jokes",
}: {
  children: ReactNode;
  title?: string;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <title>{title}</title>
        <Links />
      </head>
      <body>
        {children}
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <div className="error-container">
        <h1>{`${caught.status} ${caught.statusText}`}</h1>
      </div>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.log(error.message);
  return (
    <Document title="Error">
      <div className="error-container">
        <h1>App error</h1>
        <pre>{error.message}</pre>
      </div>
    </Document>
  );
}
