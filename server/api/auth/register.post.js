import bcrypt from "bcrypt";
import prisma from "@@/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { username, email, password } = body;

  if (!username || !email || !password) {
    return sendError(
      event,
      createError({ statusCode: 400, statusMessage: "All fields are required" })
    );
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return sendError(
      event,
      createError({
        statusCode: 409,
        statusMessage: "Email already registered"
      })
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword
    }
  });

  return {
    message: "User registered successfully",
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  };
});
