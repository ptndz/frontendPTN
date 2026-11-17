import { Copy, Edit, Eye, MoreVertical, Play, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import type { StoredStory } from '../../../services/storiesService';
import { formatRelativeDate } from '../../../utils/dateFormatter';

interface StoryCardProps {
  story: StoredStory;
  isSelected: boolean;
  showMenu: boolean;
  isMobile: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

function getSourceBadge(source?: string) {
  switch (source) {
    case 'github':
      return <span className="px-1.5 py-0.5 bg-success/20 text-success text-[9px] rounded">GitHub</span>;
    case 'file':
      return <span className="px-1.5 py-0.5 bg-accent/20 text-accent-bright text-[9px] rounded">Local</span>;
    case 'local':
      return <span className="px-1.5 py-0.5 bg-warning/20 text-warning text-[9px] rounded">Nháp</span>;
    default:
      return null;
  }
}

export function StoryCard({
  story,
  isSelected,
  showMenu,
  isMobile,
  onSelect,
  onMenuToggle,
  onEdit,
  onDuplicate,
  onExport,
  onDelete,
}: StoryCardProps) {
  const thumbUrl = story.thumbnail || story.story.thumbnail_url || story.story.thumbnail;
  const isImageThumbnail =
    thumbUrl?.startsWith('http') ||
    thumbUrl?.startsWith('/') ||
    thumbUrl?.startsWith('data:') ||
    thumbUrl?.startsWith('src/') ||
    thumbUrl?.startsWith('~/');

  return (
    <div
      className={`group bg-surface/70 backdrop-blur-sm rounded-xl border transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl ${
        isSelected
          ? 'border-accent shadow-lg ring-2 ring-accent/30 ring-offset-2 ring-offset-paper'
          : 'border-line/60 hover:border-line/80'
      }`}
      onClick={onSelect}
    >
      {/* Thumbnail */}
      <div className="aspect-[9/16] rounded-t-xl relative overflow-hidden bg-line">
        {isImageThumbnail ? (
          <img
            src={resolveMediaUrl(thumbUrl!)}
            alt={story.story.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full transition-all duration-500 group-hover:scale-105" style={{ background: thumbUrl || '#1e293b' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Slide count badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-ink/80 backdrop-blur-md rounded-full text-[10px] font-medium border border-white/10">
          {story.story.slides.length} slides
        </div>

        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-accent/30 backdrop-blur-[2px]">
          <a
            href={`/stories/${story.story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-surface/20 backdrop-blur-md rounded-full hover:bg-surface/30 transition-all duration-200 block scale-75 group-hover:scale-100 shadow-lg shadow-black/20"
            onClick={(e) => e.stopPropagation()}
          >
            <Play size={20} className="text-ink" fill="white" />
          </a>
        </div>

        {/* Menu button */}
        {!isMobile && (
          <div className="absolute top-2 right-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle();
              }}
              className="p-1.5 bg-accent/40 backdrop-blur-md rounded-lg hover:bg-ink/80 transition-all duration-200 border border-white/10"
            >
              <MoreVertical size={16} />
            </button>

            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute top-10 right-0 w-48 bg-surface/95 backdrop-blur-xl border border-line/50 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-line/70 transition-all duration-150 text-left"
                >
                  <Edit size={16} />
                  Chỉnh sửa
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-line/70 transition-all duration-150 text-left"
                >
                  <Copy size={16} />
                  Nhân bản
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onExport();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-line/70 transition-all duration-150 text-left"
                >
                  <Eye size={16} />
                  Export JSON
                </button>
                <div className="border-t border-line" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-danger/15 text-danger transition-all duration-150 text-left"
                >
                  <Trash2 size={16} />
                  Xóa
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-medium text-ink text-sm line-clamp-1 flex-1">{story.story.title}</h3>
          {getSourceBadge(story.source)}
        </div>
        <p className="text-[10px] text-muted/80">{formatRelativeDate(story.lastModified)}</p>
      </div>
    </div>
  );
}
