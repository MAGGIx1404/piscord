import prisma from "@@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = body;

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required"
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: "User not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials"
    });
  }

  const token = jwt.sign(
    {
      id: user.id
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  setCookie(event, "token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7
  });

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  };
});
