import { json, MetaFunction } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";

import { db } from "~/utils/db.server";

export const loader = async () => {
  const count = await db.joke.count();
  const randomNum = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomNum,
  });
  if (!randomJoke) {
    throw new Response("No random joke found", { status: 404 });
  }
  return json({ randomJoke });
};

export default function JokesIndexRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div>
      <p>Here's a random joke:</p>
      <p>{data.randomJoke.content}</p>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  if (caught.status === 404) {
    return <div className="error-container">No jokes to display</div>;
  }
  throw new Error("Unexpected error");
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="error-container">
      <h1>App error</h1>
      <pre>{error.message}</pre>
    </div>
  );
}
