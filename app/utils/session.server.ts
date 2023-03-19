import { db } from "./db.server";
import bcrypt from "bcryptjs";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { User } from "@prisma/client";

type LoginForm = {
  username: string;
  password: string;
};

type SessionData = {
  userId: string;
};

type SessionFlashData = {
  error: string;
};

export async function login({ username, password }: LoginForm) {
  const user = await db.user.findUnique({ where: { name: username } });
  if (!user) return null;
  if (await bcrypt.compare(password, user?.passwordHash))
    return { id: user.id, username };
  return null;
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  if (session) {
    return redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    });
  }
}

export async function register({ username, password }: LoginForm) {
  const passwordHash = await bcrypt.hash(password, await bcrypt.genSalt());
  const user = await db.user.create({
    data: {
      name: username,
      passwordHash,
    },
  });

  return { id: user.id, username };
}

const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("SESSION_SECRET not set");

const { getSession, commitSession, destroySession } =
  createCookieSessionStorage<SessionData, SessionFlashData>({
    cookie: {
      name: "__session",
      httpOnly: true,
      maxAge: 60 * 60,
      path: "/jokes",
      sameSite: "lax",
      secrets: [secret],
      secure: true,
    },
  });

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "string") return null;
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function requireUserSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");

  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}
