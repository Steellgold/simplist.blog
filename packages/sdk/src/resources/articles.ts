import type {
  ApiResponse,
  Article,
  ArticleListItem,
  ArticleListParams,
  ArticleOptionalFields,
} from "../types/api";
import { HttpClient } from "../utils/http";

export class ArticlesResource {
  constructor(private http: HttpClient) {}

  /**
   * List articles with pagination and filtering
   */
  async list(
    params?: ArticleListParams,
  ): Promise<ApiResponse<ArticleListItem[]>> {
    return this.http.get<ApiResponse<ArticleListItem[]>>("/articles", params);
  }

  /**
   * Get a single article by slug
   */
  async get(
    slug: string,
    options?: { optionalFields?: ArticleOptionalFields },
  ): Promise<ApiResponse<Article>> {
    return this.http.get<ApiResponse<Article>>(
      `/articles/${encodeURIComponent(slug)}`,
      options,
    );
  }

  /**
   * Search articles by query
   */
  async search(
    query: string,
    params?: Omit<ArticleListParams, "search">,
  ): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      ...params,
      search: query,
    });
  }

  /**
   * Get published articles only
   */
  async published(
    params?: Omit<ArticleListParams, "published">,
  ): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      ...params,
      published: true,
    });
  }

  /**
   * Get latest articles
   */
  async latest(limit: number = 10): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      limit,
      sort: "createdAt",
      order: "desc",
      published: true,
    });
  }

  /**
   * Get popular articles (by view count)
   */
  async popular(limit: number = 10): Promise<ApiResponse<ArticleListItem[]>> {
    return this.list({
      limit,
      sort: "viewCount",
      order: "desc",
      published: true,
    });
  }
}