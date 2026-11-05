import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { storeImage } from "@/lib/storage";
import { validateImage } from "@/lib/upload-rules";

export async function POST(request: Request) {
  await requireAdmin();

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was sent." }, { status: 400 });
  }
  const problem = validateImage(file);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const url = await storeImage(file);
  return NextResponse.json({ url });
}
