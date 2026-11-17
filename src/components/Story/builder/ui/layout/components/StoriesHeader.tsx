import { Plus, RefreshCw, Search, X } from 'lucide-react';

interface StoriesHeaderProps {
  storiesCount: number;
  filteredCount: number;
  isLocal: boolean;
  isLoading: boolean;
  isMobile: boolean;
  searchQuery: string;
  showMobileSearch: boolean;
  onSearchChange: (query: string) => void;
  onToggleMobileSearch: () => void;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export function StoriesHeader({
  storiesCount,
  filteredCount,
  isLocal,
  isLoading,
  isMobile,
  searchQuery,
  showMobileSearch,
  onSearchChange,
  onToggleMobileSearch,
  onRefresh,
  onCreateNew,
}: StoriesHeaderProps) {
  return (
    <div className="bg-surface border-b border-line px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className={isMobile ? 'flex-1 min-w-0' : ''}>
          <h1
            className={`font-bold text-ink ${isMobile ? 'text-lg' : 'text-2xl'}`}
          >
            {isMobile ? 'Bản tin' : 'Quản lý Bản tin'}
          </h1>
          {!isMobile && (
            <p className="text-sm text-muted mt-1">
              {storiesCount} bản tin • {filteredCount} hiển thị
              <span
                className={`ml-2 px-2 py-0.5 rounded text-xs ${isLocal ? 'bg-success/20 text-success' : 'bg-accent/20 text-accent-bright'}`}
              >
                {isLocal ? '🖥️ Dev Mode' : '☁️ Production'}
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile search toggle */}
          {isMobile && (
            <button
              onClick={onToggleMobileSearch}
              className={`p-2.5 rounded-lg border transition-colors ${
                showMobileSearch
                  ? 'border-accent bg-accent/20 text-accent-bright'
                  : 'border-line hover:bg-line'
              }`}
              title="Tìm kiếm"
            >
              {showMobileSearch ? <X size={18} /> : <Search size={18} />}
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2.5 rounded-lg border border-line hover:bg-line transition-colors disabled:opacity-50"
            title="Làm mới"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          {/* Desktop create button */}
          {!isMobile && (
            <button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent rounded-full font-medium transition-all shadow-sm text-accent-ink"
            >
              <Plus size={20} />
              Tạo bản tin mới
            </button>
          )}
        </div>
      </div>

      {/* Search - Desktop always visible, Mobile toggleable */}
      {(!isMobile || showMobileSearch) && (
        <div className={`${isMobile ? 'mt-3' : 'mt-4'}`}>
          <div className={`relative ${isMobile ? 'w-full' : 'max-w-md'}`}>
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên hoặc ID..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-paper border border-line rounded-lg pl-10 pr-4 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              autoFocus={isMobile && showMobileSearch}
            />
          </div>
        </div>
      )}
    </div>
  );
}
