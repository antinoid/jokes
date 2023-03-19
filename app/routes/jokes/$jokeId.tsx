import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useCatch,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import Joke from "~/components/joke";
import { db } from "~/utils/db.server";
import { getUserId, requireUserSession } from "~/utils/session.server";

export const loader = async ({ request, params }: LoaderArgs) => {
  const joke = await db.joke.findUnique({ where: { id: params.jokeId } });
  if (joke == null) throw new Response("Joke not found", { status: 404 });
  const userId = await getUserId(request);
  const isOwner = joke.userId === userId;
  return json({ joke, isOwner });
};

export const action = async ({ request, params }: ActionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "delete") {
    throw new Response("Operation not supported", { status: 400 });
  }
  const userId = await requireUserSession(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Joke not found", { status: 404 });
  }
  if (joke.userId !== userId) {
    throw new Response("Forbidden", { status: 403 });
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();
  return <Joke joke={data.joke} isOwner={data.isOwner} />;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400:
      return <div className="error-container">Not allowed</div>;
    case 403:
      return <div className="error-container">Forbidden</div>;
    case 404:
      return <div className="error-container">{params.jokeId} not found</div>;
    default:
      throw new Error(`Unhandled error: ${caught.status}`);
  }
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="error-container">
      <h1>App error</h1>
      <pre>{error.message}</pre>
    </div>
  );
}
