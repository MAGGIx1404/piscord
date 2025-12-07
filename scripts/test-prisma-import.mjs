import pkg from "@prisma/client";
console.log(
  "Prisma client import OK — version:",
  pkg.Prisma.prismaVersion?.client || "unknown"
);
