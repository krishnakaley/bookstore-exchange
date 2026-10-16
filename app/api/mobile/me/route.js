
import { NextResponse } from "next/server";
import connectDB from "../../../services/database/db";
import User from "../../../models/User";
import { authenticateMobileRequest } from "../../../lib/mobileauth";

export async function GET(request) {
  const auth = authenticateMobileRequest(request);

  if (auth.error) {
    return auth.error;
  }

  await connectDB();

  const user = await User.findById(auth.userId)
    .select("name email");

  if (!user) {
    return NextResponse.json(
      { message: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  });
}
