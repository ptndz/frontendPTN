import {
  Download,
  Film,
  Grid3X3,
  Layers,
  Play,
  Redo2,
  Save,
  Settings,
  Undo2,
  Upload,
  ZoomIn,
  ZoomOut,
  ArrowLeft,
} from 'lucide-react';
import type { CanvasState, Story } from '../../../types';

interface StoryBuilderHeaderProps {
  story: Story;
  onTitleChange: (title: string) => void;
  onBack?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canvasState: CanvasState;
  onCanvasStateChange: (updates: Partial<CanvasState>) => void;
  onPreview: () => void;
  onImport: () => void;
  onExportJSON: () => void;
  onExportVideo: () => void;
  onOpenSettings: () => void;

  onSave: () => void;
}

export function StoryBuilderHeader({
  story,
  onTitleChange,
  onBack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  canvasState,
  onCanvasStateChange,
  onPreview,
  onImport,
  onExportJSON,
  onExportVideo,
  onOpenSettings,

  onSave,
}: StoryBuilderHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-2.5 bg-surface/95 backdrop-blur-sm border-b border-line/50">
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-line/60 hover:bg-line text-ink hover:text-ink rounded-full transition-all duration-150 active:scale-95 text-xs font-semibold border border-line/50 shadow-xs"
            title="Đóng Studio Tin và quay lại danh sách"
          >
            <ArrowLeft size={16} />
            <span>Thoát</span>
          </button>
        )}
        <h1 className="text-base font-bold text-ink">
          Studio Tin
        </h1>
        <input
          type="text"
          value={story.title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="bg-line/50 border border-line rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-accent w-48"
          placeholder="Tiêu đề Story..."
        />

      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo */}
        <div className="flex items-center bg-line/40 rounded-xl p-0.5 border border-line/50 hover:border-line/50 transition-colors duration-200">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-all duration-150 active:scale-90 ${
              !canUndo ? 'text-muted cursor-not-allowed' : 'text-ink hover:bg-line hover:text-ink'
            }`}
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-all duration-150 active:scale-90 ${
              !canRedo ? 'text-muted cursor-not-allowed' : 'text-ink hover:bg-line hover:text-ink'
            }`}
            title="Làm lại (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center bg-line/40 rounded-xl p-0.5 border border-line/50 hover:border-line/50 transition-colors duration-200">
          <button
            onClick={() => onCanvasStateChange({ zoom: Math.max(0.5, canvasState.zoom - 0.1) })}
            className="p-1.5 text-ink hover:bg-line hover:text-ink rounded-lg transition-all duration-150 active:scale-90"
            title="Thu nhỏ"
          >
            <ZoomOut size={16} />
          </button>
          <span className="px-2 text-xs text-muted min-w-[3rem] text-center">
            {Math.round(canvasState.zoom * 100)}%
          </span>
          <button
            onClick={() => onCanvasStateChange({ zoom: Math.min(2, canvasState.zoom + 0.1) })}
            className="p-1.5 text-ink hover:bg-line hover:text-ink rounded-lg transition-all duration-150 active:scale-90"
            title="Phóng to"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        {/* Canvas options */}
        <div className="flex items-center bg-line/40 rounded-xl p-0.5 border border-line/50 hover:border-line/50 transition-colors duration-200">
          <button
            onClick={() => onCanvasStateChange({ showGrid: !canvasState.showGrid })}
            className={`p-1.5 rounded-lg transition-all duration-150 active:scale-90 ${
              canvasState.showGrid
                ? 'bg-accent text-accent-ink shadow-sm'
                : 'text-ink hover:bg-line'
            }`}
            title="Bật/tắt lưới"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => onCanvasStateChange({ showSafeZone: !canvasState.showSafeZone })}
            className={`p-1.5 rounded-lg transition-all duration-150 active:scale-90 ${
              canvasState.showSafeZone
                ? 'bg-accent text-accent-ink shadow-sm'
                : 'text-ink hover:bg-line'
            }`}
            title="Bật/tắt vùng an toàn"
          >
            <Layers size={16} />
          </button>
        </div>

        {/* Actions */}
        <button
          onClick={onPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-line hover:bg-line rounded-full text-sm transition-all duration-150 active:scale-95"
          title="Xem trước (P)"
        >
          <Play size={16} /> Xem trước
        </button>

        <div className="flex items-center bg-line/40 rounded-xl p-0.5 border border-line/50 hover:border-line/50 transition-colors duration-200">
          <button
            onClick={onImport}
            className="p-1.5 text-ink hover:bg-line hover:text-ink rounded-lg transition-all duration-150 active:scale-90"
            title="Nhập story"
          >
            <Upload size={16} />
          </button>
          <button
            onClick={onExportJSON}
            className="p-1.5 text-ink hover:bg-line hover:text-ink rounded-lg transition-all duration-150 active:scale-90"
            title="Xuất story JSON"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onExportVideo}
            className="p-1.5 text-ink hover:bg-line hover:text-ink rounded-lg transition-all duration-150 active:scale-90"
            title="Xuất story thành video"
          >
            <Film size={16} />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-1.5 text-ink hover:bg-line hover:text-ink rounded-lg transition-all duration-150 active:scale-90"
            title="Cài đặt"
          >
            <Settings size={16} />
          </button>
        </div>

        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-accent rounded-full text-sm font-medium transition-all duration-200 shadow-sm active:scale-95 text-accent-ink"
        >
          <Save size={16} /> Lưu Story
        </button>
      </div>
    </header>
  );
}
