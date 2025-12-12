import { HttpClient } from '../utils/http'
import type { ApiResponse, TagListItem } from '../types/api'

export class TagsResource {
  constructor(private http: HttpClient) {}

  /**
   * List all tags with article counts
   */
  async list(): Promise<ApiResponse<TagListItem[]>> {
    return this.http.get<ApiResponse<TagListItem[]>>('/tags')
  }

  /**
   * Get a specific tag by name
   */
  async get(name: string): Promise<ApiResponse<TagListItem>> {
    return this.http.get<ApiResponse<TagListItem>>(`/tags/${encodeURIComponent(name)}`)
  }

  /**
   * Get all tag names (convenience method)
   */
  async names(): Promise<string[]> {
    const response = await this.list()
    return response.data.map(tag => tag.name)
  }

  /**
   * Get tags sorted by article count (most popular first)
   */
  async popular(limit?: number): Promise<TagListItem[]> {
    const response = await this.list()
    const sorted = response.data.sort((a, b) => b.articleCount - a.articleCount)
    return limit ? sorted.slice(0, limit) : sorted
  }
}
