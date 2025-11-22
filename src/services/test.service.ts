import { prisma } from "../lib/prisma.js";

export const createUser = async () => {
  const user = await prisma.user.create({
    data: {
      email: "john@doe.com",
      username: "JohnDoe",
    },
  });

  return user;
};
