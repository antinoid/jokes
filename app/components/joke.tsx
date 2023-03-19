import { Joke } from "@prisma/client";
import { Form, Link } from "@remix-run/react";

type JokeProps = {
  joke: Pick<Joke, "name" | "content">;
  isOwner: boolean;
  canDelete?: boolean;
};

export default function Joke({ joke, isOwner, canDelete = true }: JokeProps) {
  return (
    <div>
      <p>Joke:</p>
      <p>{joke.content}</p>
      {isOwner ? (
        <Form method="post">
          <button
            className="button"
            name="intent"
            type="submit"
            value="delete"
            disabled={!canDelete}
          >
            Delete
          </button>
        </Form>
      ) : null}
      <Link to=".">{joke.name} Permalink</Link>
    </div>
  );
}
