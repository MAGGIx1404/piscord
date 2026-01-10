import * as yup from "yup";
import { createSession } from "~~/server/service/session";

import { createUser, findUserByEmail, findUserByUsername } from "~~/server/service/user";
import { setSessionCookies } from "~~/server/utils/cookie";
import { hashPassword } from "~~/server/utils/crypto";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(20).required(),
  username: yup.string().min(3).max(30).required(),
  remember_me: yup.boolean().optional().default(false)
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validate = await schema.validate(body);

  const existingUser = await findUserByEmail(validate.email);
  if (existingUser) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: "User with this email already exists"
      })
    );
  }

  const userWithUsername = await findUserByUsername(validate.username);
  if (userWithUsername) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: "Username is already taken"
      })
    );
  }

  const hash = await hashPassword(validate.password);

  const user = await createUser({
    email: validate.email,
    first_name: "NOT_SET",
    last_name: "NOT_SET",
    username: validate.username,
    password: hash
  });

  const { sessionId, token, sessionExpiresIn } = await createSession(
    { user_id: user.id },
    validate.remember_me
  );

  setSessionCookies(event, {
    sessionId,
    token,
    sessionExpiresIn,
    rememberMe: validate.remember_me
  });

  return {
    user: { id: user.id, email: user.email, username: user.username },
    session: { session_id: sessionId, token }
  };
});
