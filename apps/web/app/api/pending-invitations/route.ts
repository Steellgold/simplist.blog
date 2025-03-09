import { auth, pool } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async(req: NextRequest): Promise<NextResponse> => {
  const session = await auth.api.getSession({ headers: req.headers });
  
  if (!session) {
    return NextResponse.redirect("/auth");
  }
  
  const invitations = await pool.query(
    `SELECT * FROM invitation WHERE email = $1 AND status = 'pending'`,
    [session.user.email]
  );

  return NextResponse.json({ invitations: invitations.rows });
}
