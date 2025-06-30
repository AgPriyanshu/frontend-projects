import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter, Download, Eye, EyeOff, SortAsc, SortDesc } from 'lucide-react';

interface FeatureAttributes {
  [key: string]: any;
}

interface FeatureTableProps {
  features: FeatureAttributes[];
  layerName: string;
  onFeatureSelect?: (feature: FeatureAttributes) => void;
  onClose?: () => void;
  isLoading?: boolean;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export function FeatureTable({ 
  features, 
  layerName, 
  onFeatureSelect, 
  onClose, 
  isLoading = false 
}: FeatureTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set());
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Get all unique column names from features
  const allColumns = useMemo(() => {
    if (features.length === 0) return [];
    
    const columns = new Set<string>();
    features.forEach(feature => {
      Object.keys(feature).forEach(key => {
        if (!key.startsWith('_')) {
          columns.add(key);
        }
      });
    });
    
    return Array.from(columns).sort();
  }, [features]);

  // Initialize visible columns if empty
  useMemo(() => {
    if (visibleColumns.size === 0 && allColumns.length > 0) {
      setVisibleColumns(new Set(allColumns.slice(0, 10))); // Show first 10 columns by default
    }
  }, [allColumns, visibleColumns.size]);

  // Filter and sort features
  const processedFeatures = useMemo(() => {
    let filtered = features.filter(feature => {
      if (!searchTerm) return true;
      
      return Object.entries(feature).some(([key, value]) => {
        if (key.startsWith('_')) return false;
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      });
    });

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        const comparison = String(aVal).localeCompare(String(bVal));
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [features, searchTerm, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedFeatures.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeatures = processedFeatures.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (key: string) => {
    setSortConfig(current => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Handle column visibility toggle
  const toggleColumn = (column: string) => {
    setVisibleColumns(current => {
      const newSet = new Set(current);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    if (processedFeatures.length === 0) return;

    const headers = ['ID', 'Type', ...Array.from(visibleColumns)];
    const csvContent = [
      headers.join(','),
      ...processedFeatures.map(feature => [
        feature._featureId || '',
        feature._geometryType || '',
        ...Array.from(visibleColumns).map(col => {
          const value = feature[col];
          return value !== null && value !== undefined ? `"${String(value).replace(/"/g, '""')}"` : '';
        })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layerName}_features.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return <SortAsc className="h-3 w-3 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  if (isLoading) {
    return (
      <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border overflow-hidden">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2 text-muted-foreground">Loading feature table...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-lg border border-border overflow-hidden feature-table-container">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-primary rounded flex items-center justify-center">
            <span className="text-xs text-primary-foreground font-bold">T</span>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Feature Table</h3>
            <p className="text-sm text-muted-foreground">
              {layerName} • {processedFeatures.length} features
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
            title="Export to CSV"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
            title="Column settings"
          >
            <Filter className="h-4 w-4" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
              title="Close table"
            >
              <span className="text-lg">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Column Selector */}
      {showColumnSelector && (
        <div className="p-4 border-b border-border bg-muted/20">
          <h4 className="font-medium text-sm mb-3">Visible Columns</h4>
          <div className="grid grid-cols-3 gap-2">
            {allColumns.map(column => (
              <label key={column} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={visibleColumns.has(column)}
                  onChange={() => toggleColumn(column)}
                  className="rounded"
                />
                <span className="truncate">{column}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Search and Controls */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
            <option value={200}>200 per page</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-3 font-medium text-muted-foreground min-w-[80px]">ID</th>
              <th className="text-left p-3 font-medium text-muted-foreground min-w-[100px]">Type</th>
              {Array.from(visibleColumns).map(column => (
                <th 
                  key={column} 
                  className="text-left p-3 font-medium text-muted-foreground min-w-[120px] cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-1">
                    <span className="truncate">{column}</span>
                    {getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentFeatures.map((feature, index) => (
              <tr 
                key={index} 
                className="border-b border-border/50 hover:bg-muted/20 cursor-pointer transition-colors"
                onClick={() => onFeatureSelect?.(feature)}
              >
                <td className="p-3 font-mono text-xs text-muted-foreground">
                  {feature._featureId || index + startIndex + 1}
                </td>
                <td className="p-3 text-xs">
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {feature._geometryType || 'Unknown'}
                  </span>
                </td>
                {Array.from(visibleColumns).map(column => (
                  <td key={column} className="p-3 text-xs font-mono max-w-[150px] truncate" title={String(feature[column] || '')}>
                    {feature[column] !== null && feature[column] !== undefined ? String(feature[column]) : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, processedFeatures.length)} of {processedFeatures.length} features
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-border bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-border bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {processedFeatures.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-muted-foreground">
            {searchTerm ? 'No features match your search criteria.' : 'No features available in this layer.'}
          </div>
        </div>
      )}
    </div>
  );
} 