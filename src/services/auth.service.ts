import { createHash, randomBytes } from "node:crypto";
import * as jose from "jose";
import { prisma } from "../lib/prisma.js";

export const refreshAccessToken = async (refreshToken: string | undefined) => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;

  if (!accessTokenSecret) {
    throw new Error("Missing 'ACCESS_TOKEN_SECRET' environment variable.");
  }

  if (!refreshToken) {
    throw new Error("Missing refresh token cookie.");
  }

  const hashedRefreshToken = createHash("sha256")
    .update(refreshToken)
    .digest("base64");

  const foundRefreshToken = await prisma.refreshToken.findFirst({
    where: {
      hashedToken: hashedRefreshToken,
    },
  });

  if (!foundRefreshToken) {
    throw new Error("Unauthorized.");
  }

  const newRefreshToken = randomBytes(64).toString("base64");
  const newHashedRefreshToken = createHash("sha256")
    .update(newRefreshToken)
    .digest("base64");

  // Thirty days from now
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      hashedToken: newHashedRefreshToken,
      expiresAt,
      userId: foundRefreshToken.userId,
    },
  });

  const secret = new TextEncoder().encode(accessTokenSecret);
  const jwt = await new jose.SignJWT({ sub: foundRefreshToken.userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10min")
    .sign(secret);

  await prisma.refreshToken.delete({
    where: {
      id: foundRefreshToken.id,
    },
  });

  return {
    jwt,
    refreshToken: {
      token: newRefreshToken,
      expiresAt,
    },
  };
};
