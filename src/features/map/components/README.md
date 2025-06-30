# Map Feature Table Components

This directory contains components for displaying feature tables in the map interface.

## Components

### FeatureTable

A comprehensive table component for displaying map features with the following capabilities:

- **Sorting**: Click column headers to sort by any attribute
- **Search**: Global search across all feature attributes
- **Pagination**: Configurable items per page (25, 50, 100, 200)
- **Column Management**: Show/hide columns as needed
- **Export**: Download table data as CSV
- **Feature Selection**: Click on rows to view detailed feature attributes

#### Props

```typescript
interface FeatureTableProps {
  features: FeatureAttributes[];        // Array of feature data
  layerName: string;                   // Name of the layer
  onFeatureSelect?: (feature: FeatureAttributes) => void;  // Callback when feature is selected
  onClose?: () => void;                // Callback to close the table
  isLoading?: boolean;                 // Loading state
}
```

#### Usage

```tsx
<FeatureTable
  features={layerFeatures}
  layerName="My Layer"
  onFeatureSelect={(feature) => console.log('Selected:', feature)}
  onClose={() => setTableOpen(false)}
  isLoading={false}
/>
```

### TableButton

A simple button component for opening feature tables.

#### Props

```typescript
interface TableButtonProps {
  onClick: () => void;                 // Click handler
  disabled?: boolean;                  // Disabled state
  title?: string;                      // Tooltip text
  className?: string;                  // Additional CSS classes
}
```

#### Usage

```tsx
<TableButton
  onClick={() => openFeatureTable(layerId, layerName)}
  title="Open feature table"
/>
```

## Integration with Map Component

The feature table is integrated into the main Map component with the following features:

1. **Table Button**: Each layer in the layers panel has a table button (📊)
2. **Table Display**: Opens in the top-left corner of the map
3. **Feature Selection**: Clicking a row in the table opens the feature attributes panel
4. **State Management**: Integrated with the map's state management system

## Features

### Search and Filter
- Global search across all feature attributes
- Real-time filtering as you type
- Case-insensitive search

### Sorting
- Click any column header to sort
- Toggle between ascending and descending order
- Visual indicators show current sort state

### Column Management
- Show/hide columns using the filter button
- Default shows first 10 columns
- All columns are available for selection

### Export
- Export current filtered/sorted data as CSV
- Includes all visible columns
- Filename includes layer name

### Responsive Design
- Adapts to different screen sizes
- Horizontal scrolling for wide tables
- Configurable maximum dimensions

## Styling

The components use Tailwind CSS classes and custom CSS for styling:

- Consistent with the map interface design
- Dark/light theme support
- Hover effects and transitions
- Sticky headers for better usability

## Performance

- Virtual scrolling for large datasets (shows 100 features max in basic view)
- Efficient filtering and sorting
- Lazy loading of feature data
- Optimized re-renders 