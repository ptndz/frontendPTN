import React from 'react'
import type { Story } from '../types'

interface StoryBuilderProps {
  initialStory?: Story | null;
  onBack: () => void;
  onSaved?: () => void;
}

export const StoryBuilder: React.FC<StoryBuilderProps> = ({
  initialStory,
  onBack,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <button
          onClick={onBack}
          className="px-3 py-1.5 border border-border rounded-xl text-xs font-semibold hover:bg-secondary/40 transition-colors"
        >
          ← Quay lại danh sách
        </button>
        <h2 className="text-lg font-bold text-foreground">
          {initialStory ? `Chỉnh sửa: ${initialStory.title}` : 'Tạo Story mới'}
        </h2>
        <div className="w-20" />
      </div>
      <div className="h-[600px] border border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground">
        Đang khởi tạo Visual Story Canvas...
      </div>
    </div>
  )
}
