import { Copy, Edit, Eye, Play, Trash2 } from 'lucide-react';
import { BottomSheet } from '../../../mobile';
import type { StoredStory } from '../../../services/storiesService';

interface MobileStoryActionsProps {
  story: StoredStory | null;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onDelete: () => void;
}

export function MobileStoryActions({
  story,
  onClose,
  onEdit,
  onDuplicate,
  onExport,
  onDelete,
}: MobileStoryActionsProps) {
  return (
    <BottomSheet
      isOpen={!!story}
      onClose={onClose}
      title={story?.story.title || 'Tùy chọn'}
      snapPoints={[0.4]}
      initialSnap={0}
    >
      {story && (
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              onEdit();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-line rounded-lg transition-colors"
          >
            <Edit size={20} className="text-accent-bright" />
            <span className="text-ink">Chỉnh sửa</span>
          </button>
          <button
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-line rounded-lg transition-colors"
          >
            <Copy size={20} className="text-success" />
            <span className="text-ink">Nhân bản</span>
          </button>
          <button
            onClick={() => {
              onExport();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-line rounded-lg transition-colors"
          >
            <Eye size={20} className="text-accent-bright" />
            <span className="text-ink">Xuất JSON</span>
          </button>
          <a
            href={`/stories/${story.story.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-line rounded-lg transition-colors"
            onClick={onClose}
          >
            <Play size={20} className="text-cyan-400" />
            <span className="text-ink">Xem trước</span>
          </a>
          <div className="border-t border-line my-2" />
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-danger/20 rounded-lg transition-colors"
          >
            <Trash2 size={20} className="text-danger" />
            <span className="text-danger">Xóa</span>
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
