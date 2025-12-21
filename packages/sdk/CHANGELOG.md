# Changelog

All notable changes to the @simplist.blog/sdk package will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
