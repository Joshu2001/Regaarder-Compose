# Live Visual Dashboard Implementation & Architecture Documentation

## Executive Overview
The **Live Visual Chart / Dashboard** feature in **Regaarder Compose** has been updated to dynamically parse, calculate, and render chart visualizations based on whatever data is present or uploaded into the active worksheet grid (such as Sales, Units Sold, ARPU, or Gross Margin), rather than displaying generic static mock numbers (such as fixed $2.0M–$12.0M revenue metrics).

---

## Key Problems Resolved
1. **Static Placeholder Data**: Previously, the `TemplateChartVisualizer` component used hardcoded arrays (`revenueGrowthValues`, `revenueMixItems`, `grossMarginValues`, `ebitdaValues`) that never changed when custom user data was loaded into the grid.
2. **Missing Dynamic Scaling**: Chart SVG paths, Y-axis labels, and bar heights were anchored to fixed pixel coordinates and static ranges.
3. **No Multi-Column Selection**: Uploading datasets with multiple numerical columns provided no way to toggle between metrics.

---

## Technical Architecture & How It Works

```
┌────────────────────────┐      ┌─────────────────────────────┐      ┌──────────────────────────────────┐
│  Active Sheet Grid     │ ───► │  extractTemplateChartData   │ ───► │    TemplateChartVisualizer       │
│  (Uploaded CSV/Grid)   │      │  (Data Extraction Engine)   │      │  (Dynamic SVG Charts & Metrics)  │
└────────────────────────┘      └─────────────────────────────┘      └──────────────────────────────────┘
```

### 1. Dynamic Data Parsing Engine (`extractTemplateChartData`)
Located in [App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx#L9590), this function evaluates the active sheet grid without relying on hardcoded column indices:

- **Title & Header Detection**: Scans the top 5 rows to locate the primary header row containing column labels (e.g. `Revenue per customer`, `Gross margin`, `Customer lifespan`, `ARPU`, `Sales`).
- **Label Column Isolation**: Identifies text/category columns vs. numeric columns.
- **Numerical Column Extraction**: Filters all columns where numeric values comprise at least 40% of non-empty cells.
- **Data Series & Summary Stats**: Computes dataset totals, averages, maximums, minimums, and category slices live.

### 2. Dynamic Visual Dashboard (`TemplateChartVisualizer`)
Located in [App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx#L9740), this component transforms extracted grid data into live visual cards:

#### A. Column Switcher Dropdown
- When a sheet has multiple numeric columns (e.g. `Revenue per customer`, `Gross margin`, `ARPU`), a dropdown selector automatically appears in the top header.
- Users can switch active chart targets dynamically.

#### B. Dynamic Area & Line Chart Scaling
- Automatically computes bounds:
  $$\text{range} = \max(\text{series}) - \min(\text{series})$$
- Normalizes data points to SVG viewBox coordinates:
  $$y = 55 - \left(\frac{\text{value} - \text{min}}{\text{range}}\right) \times 43$$
- Formats labels dynamically ($1.2M, $450K, 75%, 120, etc.).

#### C. Item Comparison Bar Chart
- Renders SVG `<rect>` elements scaled dynamically to row values with responsive widths.

#### D. Category Share Donut Chart
- Calculates slice percentages based on dataset total:
  $$\text{pct} = \text{Math.round}\left(\frac{\text{value}}{\text{total}} \times 100\right)$$

#### E. Summary KPI Footer Row
- Displays live KPI blocks for **Total**, **Average**, **Peak Max**, and **Minimum** for the active column.

---

## File Changes
- Modified: [src/App.jsx](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/src/App.jsx)
- Added Documentation: [LIVE_VISUAL_DASHBOARD.md](file:///c:/Users/user/Downloads/Project%20MOAT/Regaarder%20Compose/LIVE_VISUAL_DASHBOARD.md)

## How to Test / Verify
1. Open **Regaarder Compose** and load or upload any dataset (e.g. Sales report, financial forecast, or inventory data).
2. Open the **Visualize / Live Visual Chart** side panel.
3. Observe that all chart card titles, SVG trend lines, bar heights, donut slices, and KPI metrics adapt to your data.
4. Edit any cell in the sheet—charts will update instantly.
