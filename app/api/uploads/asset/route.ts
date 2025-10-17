import { NextResponse } from "next/server"
import { uploadAsset } from "@/lib/actions/assets"

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData()
    const result = await uploadAsset(formData)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Asset upload error:", error)
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    )
  }
}

