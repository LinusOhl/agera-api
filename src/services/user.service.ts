import type { UserCreateInput } from "../../generated/prisma/models.js";
import { prisma } from "../lib/prisma.js";

// TODO: check if email and/or username is in use. Check email format.
export const createUser = async (data: UserCreateInput) => {
  if (!data.email) {
    throw new Error("Missing 'email' field.");
  }

  if (!data.username) {
    throw new Error("Missing 'username' field.");
  }

  const createdUser = await prisma.user.create({
    data,
  });

  return createdUser;
};
