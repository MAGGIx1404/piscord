import * as yup from "yup";
import { createSession } from "~~/server/service/session";
import { findUserByEmail } from "~~/server/service/user";
import { setSessionCookies } from "~~/server/utils/cookie";

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(8).max(100).required(),
  remember_me: yup.boolean().optional().default(false)
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const validate = await schema.validate(body);

  const user = await findUserByEmail(validate.email);
  if (!user) {
    await hashPassword(validate.password);
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: "Invalid email or password"
      })
    );
  }

  const isPasswordValid = await verifyPassword({
    hash: user.password,
    password: validate.password
  });

  if (!isPasswordValid) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "Invalid email or password" })
    );
  }

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
