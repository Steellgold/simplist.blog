import { HttpClient } from '../utils/http'
import type { ApiResponse, ProjectInfo } from '../types/api'

export class ProjectsResource {
  constructor(private http: HttpClient) {}

  /**
   * Get project information and statistics
   */
  async get(): Promise<ApiResponse<ProjectInfo>> {
    return this.http.get<ApiResponse<ProjectInfo>>('/v1/project')
  }

  /**
   * Get project info only (without stats)
   */
  async getInfo(): Promise<ProjectInfo['project']> {
    const response = await this.get()
    return response.data.project
  }

  /**
   * Get project statistics only
   */
  async getStats(): Promise<ProjectInfo['stats']> {
    const response = await this.get()
    return response.data.stats
  }
}