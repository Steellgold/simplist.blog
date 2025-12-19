import type { ApiResponse, TagListItem } from "../types/api";
import { HttpClient } from "../utils/http";

export interface TagListParams {
  sort?: "name" | "articleCount" | "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  limit?: number;
}

export class TagsResource {
  constructor(private http: HttpClient) {}

  /**
   * List all tags with article counts
   */
  async list(params?: TagListParams): Promise<ApiResponse<TagListItem[]>> {
    return this.http.get<ApiResponse<TagListItem[]>>("/tags", params);
  }

  /**
   * Get a specific tag by name
   */
  async get(name: string): Promise<ApiResponse<TagListItem>> {
    return this.http.get<ApiResponse<TagListItem>>(
      `/tags/${encodeURIComponent(name)}`,
    );
  }

  /**
   * Get all tag names (convenience method)
   */
  async names(): Promise<string[]> {
    const response = await this.list();
    return response.data.map((tag) => tag.name);
  }

  /**
   * Get tags sorted by article count (most popular first)
   */
  async popular(limit?: number): Promise<TagListItem[]> {
    const response = await this.list({
      sort: "articleCount",
      order: "desc",
      limit,
    });
    return response.data;
  }
}