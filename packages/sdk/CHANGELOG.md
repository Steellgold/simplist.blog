# Changelog

All notable changes to the @simplist.blog/sdk package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.12] - 2026-01-16

### Added

- **Field Selection API**: New `select` parameter for customizing article response fields
  - Allows excluding heavy fields like `content` and `variants` to reduce payload size
  - Enables including optional tag metadata (`tagColor`, `tagIcon`)
  - Available in both `client.articles.list()` and `client.articles.get()`
  - Fully customizable: include/exclude any article field individually
- **ArticleSelectFields** type with comprehensive field options:
  - Content fields: `content`, `excerpt`, `coverImage`
  - Metadata: `title`, `slug`, `published`, `status`, `viewCount`
  - Relations: `author`, `lastUpdatedBy`, `tags`, `variants`, `project`
  - Tag fields: `tagColor`, `tagIcon`
  - Statistics: `wordCount`, `characterCount`, `readTimeMinutes`
  - Timestamps: `createdAt`, `updatedAt`, `publishedAt`

### Changed

- **API**: Updated `GET /v1/articles` and `GET /v1/articles/:slug` to support field selection via `select` query parameter
- **SDK**: Replaced `optionalFields` with `select` parameter (backwards compatible via type alias)
- **HttpClient**: Enhanced to serialize `select` parameter as JSON
- **Format utility**: Added field filtering logic while maintaining backwards compatibility

### Improved

- **Performance**: List endpoints can now return significantly lighter payloads by excluding `content` field
- **Flexibility**: Clients can optimize response size based on their specific needs
- **Documentation**: Added comprehensive field selection examples in SDK and API docs
- **RSS Feed**: Continues to include full content (unchanged, as required by RSS spec)

### Backwards Compatibility

- Without `select` parameter: All fields included by default (existing behavior)
- `optionalFields` remains supported as a legacy alias for `select`
- No breaking changes to existing API or SDK usage

## [0.0.11] - 2025-12-21

### Fixed

- **CRITICAL**: Fixed `getVariantOrDefault()` language selection logic
  - Now correctly returns main article when requested language matches fallback language and no variant exists
  - Previously would incorrectly return first available variant instead of main article
  - Fixes multilingual content displaying wrong language to users

- **CRITICAL**: Fixed memory leak in `HttpClient.makeRequest()`
  - Timeout is now properly cleaned up in all code paths using try-finally
  - Previously, timeout would not be cleared when errors were thrown
  - Prevents timeout accumulation and unpredictable behavior

- **CRITICAL**: Fixed API key validation to be more strict
  - Now uses `startsWith("prj_")` instead of `includes("prj_")`
  - Also validates minimum key length (must be longer than 4 characters)
  - Prevents false positives with invalid API keys

- Fixed `getBestMatchingVariant()` to handle falsy values correctly
  - Now properly checks for `undefined` and `null` instead of using `||` operator
  - Prevents unintended fallback when empty string is explicitly passed

- Fixed `HttpClient.get()` array parameter handling
  - Arrays are now correctly appended as multiple query parameters
  - Example: `tags: ["typescript", "react"]` now generates `?tags=typescript&tags=react`
  - Fixes tag filtering functionality

- Fixed `detectUserLanguage()` to support SSR environments
  - Added optional `serverLang` parameter for server-side language detection
  - Can now pass language from Accept-Language header or cookies
  - Improves SSR compatibility with Next.js and other frameworks

- Fixed `VariantSelector.getSelectedLanguage()` to use `article.lang` when available
  - Now checks for `lang` property on main article
  - More accurate language detection for content

### Added

- Added `lang?: LanguageCode` property to `Article` interface
  - Allows specifying the language of the main article content
  - Improves multilingual content handling and clarity

- Added TypeScript overloads to `getSitemap()` for better type safety
  - `getSitemap(baseUrl, "xml")` now returns `Promise<string>`
  - `getSitemap(baseUrl, "json")` now returns `Promise<Sitemap>`
  - Provides perfect TypeScript inference without type guards

- Added language code validation in variant helper functions
  - `getVariantOrDefault()` now validates language codes with helpful warnings
  - Prevents errors from invalid language codes
  - Automatically falls back to valid alternatives

### Improved

- Simplified `AnalyticsResource.getStats()` and `getFunnel()` methods
  - Now use `http.get()` with params directly instead of manual URLSearchParams construction
  - Cleaner code and better maintainability

- Enhanced documentation with detailed SSR usage examples
  - Better explanations of multilingual article structure
  - Added notes about assumptions and fallback behavior

## [0.0.10] - 2025-12-21

### Fixed

- **BREAKING FIX**: `getBestMatchingVariant()` now correctly respects the `userLang` parameter instead of ignoring it
  - Previously: The function always called `detectUserLanguage()` internally, ignoring the provided parameter
  - Now: The function uses the provided `userLang` parameter when specified, falling back to auto-detection only when not provided
  - **API Change**: Parameter renamed from `defaultLang` to `userLang` for clarity
  - **New**: Added second optional parameter `fallbackLang` for specifying a custom fallback language (defaults to English)

### Changed

- Updated documentation examples to reflect the corrected `getBestMatchingVariant()` behavior
- Improved clarity in multilingual helper function documentation

## [0.0.9] - 2025-12-13

### Added

- **Tags API**: New `client.tags` resource for managing and querying tags
  - `client.tags.list()` - Get all tags with article counts
  - `client.tags.get(tagName)` - Get specific tag details
  - `client.tags.names()` - Get array of tag names
  - `client.tags.popular(limit)` - Get most popular tags
- **Article filtering by tags**: Enhanced `client.articles.list()` with tag filters
  - `tags` - Filter by any of these tags (OR logic)
  - `tagsAll` - Filter by all of these tags (AND logic)
  - `excludeTags` - Exclude articles with these tags
- **Optional tag fields**: `optionalFields` parameter in article queries
  - `tagColor` - Include hex color codes for tags
  - `tagIcon` - Include icon identifiers for tags

### Changed

- Enhanced README with comprehensive API key usage documentation
- Improved environment variable instructions and examples
- Added more detailed examples for various SDK usage patterns
- Updated index exports for better type inference

## [0.0.8] - 2025-12-21

### Added

- New `Author` interface with user details (name, firstName, lastName, image)
- `author` field to Article interface for article author information
- `lastUpdatedBy` field to Article interface (nullable) for tracking last editor

### Changed

- Updated README with author usage examples and documentation
- Enhanced Article type definitions with author metadata

## [0.0.7] - 2025-10-26

### Added

- Documentation for `client.analytics.update()` method for updating page view metrics
- Documentation for `client.articles.popular()` method for fetching popular articles
- Complete multilingual support documentation with variant helpers
- Documentation for `VariantSelector` React component
- Additional TypeScript type exports in documentation

### Changed

- Enhanced analytics tracking documentation with complete workflow (track + update)
- Improved TypeScript support section with all exported types

### Fixed

- Missing documentation for existing SDK features
- Incomplete API reference sections

## [0.0.6] - Previous release

- Initial public release with core functionality
