import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/adminAuth";

export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  return NextResponse.json(
    {
      ok: false,
      pendingDeploy: true,
      message: "Product changes are stored. Redeploy the app in Hostinger to publish them.",
    },
    { status: 409 },
  );
}
