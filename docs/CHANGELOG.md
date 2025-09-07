# Changelog

## [Unreleased] - 2025-08-31

### Changed
- **Dashboard cleanup: removed Smart Actions, normalized layout**
  - Removed Smart Actions section from dashboard (gated behind `DASHBOARD_SMART_ACTIONS=false` feature flag)
  - Implemented clean, consistent grid layout: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
  - Updated container spacing: `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6`
  - Applied consistent card styling: `rounded-2xl border shadow-sm p-4 md:p-5 bg-white min-w-[240px] h-auto`
  - Normalized typography: page title (`text-2xl md:text-3xl font-semibold tracking-tight text-slate-900`), section headings (`text-base font-medium text-slate-700`), body text (`text-sm text-slate-600`)
  - Added floating action button with proper positioning (`fixed bottom-6 right-6 z-40`)
  - Fixed FAB overlap by adding bottom padding (`pb-24`) to main container
  - Removed rainbow-colored panels in favor of clean slate color scheme
  - Simplified component structure and removed unused animations

### Fixed
- **Dashboard Cards Layout & Typography**: Fixed vertical venue text, misaligned icons/labels, overflowing emails, and FAB overlapping list issues
  - Implemented responsive CSS grid layout with proper breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
  - Added consistent card styling with `min-w-[220px]`, `h-auto`, `p-4 md:p-5`, `rounded-2xl`, `shadow-sm`, `border`
  - Fixed text orientation by removing vertical writing-mode and implementing proper truncation with `TruncatedText` component
  - Improved icon and label alignment using `flex items-center gap-2` with consistent sizing (`h-5 w-5`)
  - Moved edit actions to card headers for better UX
  - Applied clean typography scale: card titles (`text-sm font-medium text-slate-700`), primary values (`text-2xl font-semibold tracking-tight`), captions (`text-xs text-slate-500`)
  - Fixed FAB overlap by adjusting positioning and adding bottom padding to Important Dates list
  - Enhanced accessibility with proper `aria-label` attributes and focus states
  - Created reusable `TruncatedText` and `CardHeader` components for consistent text handling

### Added
- `TruncatedText` component for safe text truncation with tooltips
- `CardHeader` component with actions slot for consistent card headers 