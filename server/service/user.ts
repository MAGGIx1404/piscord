import { db, generateId } from "../db";
import type { CreateUser } from "../db/tables/user";

export async function findUserByEmail(email: string) {
  const user = await db
    .selectFrom("users")
    .where("email", "=", email)
    .selectAll()
    .executeTakeFirst();
  return user;
}

export async function findUserById(id: string) {
  const user = await db.selectFrom("users").where("id", "=", id).selectAll().executeTakeFirst();
  return user;
}

export async function findUserByUsername(username: string) {
  const user = await db
    .selectFrom("users")
    .where("username", "=", username)
    .selectAll()
    .executeTakeFirst();
  console.log(db.selectFrom("users").where("username", "=", username).selectAll().compile());
  return user;
}

export async function createUser(userData: Omit<CreateUser, "id">) {
  const user = await db
    .insertInto("users")
    .values({
      ...userData,
      id: generateId()
    })
    .returningAll()
    .executeTakeFirstOrThrow();
  return user;
}
