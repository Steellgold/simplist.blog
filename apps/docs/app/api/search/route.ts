import { searchDocs } from "@/lib/search"
import { NextResponse } from "next/server"

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")

  if (!query || !query.trim()) {
    return NextResponse.json([])
  }

  try {
    const results = await searchDocs(query)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Error during search:", error)
    return NextResponse.json([], { status: 500 })
  }
}