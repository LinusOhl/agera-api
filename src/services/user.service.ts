import { createHash, hash, randomBytes } from "node:crypto";
import { TextEncoder } from "node:util";
import argon2 from "argon2";
import * as jose from "jose";
import { emailRegex } from "../helpers.js";
import { prisma } from "../lib/prisma.js";
import type { LoginCredentials, UserCreateData } from "../types/auth.types.js";

export const createUser = async (data: UserCreateData) => {
  const passwordPepper = process.env.PASSWORD_PEPPER;

  if (!passwordPepper) {
    throw new Error("Missing 'PASSWORD_PEPPER' environment variable.");
  }

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

  const hash = await argon2.hash(data.password, {
    type: argon2.argon2id,
    secret: Buffer.from(passwordPepper),
  });

  const createdUser = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      hashedPassword: hash,
    },
  });

  return createdUser;
};

export const loginUser = async (data: LoginCredentials) => {
  const passwordPepper = process.env.PASSWORD_PEPPER;
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

  if (!passwordPepper) {
    throw new Error("Missing 'PASSWORD_PEPPER' environment variable.");
  }

  if (!accessTokenSecret) {
    throw new Error("Missing 'ACCESS_TOKEN_SECRET' environment variable.");
  }

  if (!refreshTokenSecret) {
    throw new Error("Missing 'REFRESH_TOKEN_SECRET' environment variable.");
  }

  if (!data.email) {
    throw new Error("Missing 'email' field.");
  }

  if (!data.password) {
    throw new Error("Missing 'password' field.");
  }

  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    throw new Error("Invalid login credentials.");
  }

  const matchingPassword = await argon2.verify(
    user.hashedPassword,
    data.password,
    {
      secret: Buffer.from(passwordPepper),
    },
  );

  if (!matchingPassword) {
    throw new Error("Invalid login credentials.");
  }

  const refreshToken = randomBytes(64).toString("base64");
  const hashedRefreshToken = createHash("sha256")
    .update(refreshToken)
    .digest("base64");

  // Thirty days from now
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      hashedToken: hashedRefreshToken,
      expiresAt: expiresAt,
      userId: user.id,
    },
  });

  const secret = new TextEncoder().encode(accessTokenSecret);
  const jwt = await new jose.SignJWT({ sub: user.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10min")
    .sign(secret);

  return {
    jwt,
    refreshToken: {
      token: refreshToken,
      expiresAt,
    },
  };
};
