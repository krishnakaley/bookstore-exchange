
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export function authenticateMobileRequest(request) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const token = authorization.slice(7);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { issuer: "bookswap-api" }
    );

    if (
      typeof payload === "string" ||
      typeof payload.sub !== "string"
    ) {
      throw new Error("Invalid token payload");
    }

    return { userId: payload.sub };
  } catch {
    return {
      error: NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      ),
    };
  }
}
