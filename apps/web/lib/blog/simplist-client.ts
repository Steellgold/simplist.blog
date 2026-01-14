import { SimplistClient } from "@simplist.blog/sdk";

export const simplistClient = new SimplistClient({
  path: "posts",
  apiKey: process.env.NEXT_PUBLIC_SIMPLIST_API_KEY,
});