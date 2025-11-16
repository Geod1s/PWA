import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", params.id)

  if (error) {
    console.error("[API] Failed to delete product", error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    )
  }

  return NextResponse.json({ success: true })
}
