import argon2 from "argon2";
import type { UserCreateInput } from "../../generated/prisma/models.js";
import { emailRegex } from "../helpers.js";
import { prisma } from "../lib/prisma.js";

export const createUser = async (data: UserCreateInput) => {
  if (!data.firstName) {
    throw new Error("Missing 'firstName' field.");
  }

  if (!data.lastName) {
    throw new Error("Missing 'lastName' field.");
  }

  if (!data.email) {
    throw new Error("Missing 'email' field.");
  }

  const existingEmail = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingEmail) {
    throw new Error("Email is already in use.");
  }

  if (!emailRegex.test(data.email)) {
    throw new Error("Invalid 'email' format.");
  }

  if (!data.password) {
    throw new Error("Missing 'password' field.");
  }

  const passwordPepper = process.env.PASSWORD_PEPPER;

  if (!passwordPepper) {
    throw new Error("Missing 'PASSWORD_PEPPER' environment variable.");
  }

  const hash = await argon2.hash(data.password, {
    type: argon2.argon2id,
    secret: Buffer.from(passwordPepper),
  });

  const createdUser = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hash,
    },
  });

  return createdUser;
};

// export const testingArgon2Hash = async () => {
//   const password = "johnnydoe";

//   const hash = await argon2.hash(password, {
//     type: argon2.argon2id,
//     secret: Buffer.from(peppers),
//   });

//   return hash;
// };

// export const testingArgon2Verify = async () => {
//   const t = await argon2.verify(hashedPassword, "johnnydoe", {
//     secret: Buffer.from(peppered),
//   });

//   console.log("passwordToHash:", "johnnydoe");
//   console.log("hashedPassword:", hashedPassword);
//   console.log("peppers:", peppered);

//   return t;
// };
