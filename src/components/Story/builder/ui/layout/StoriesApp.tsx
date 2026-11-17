import React, { useState } from 'react';
import type { Story } from '../../types';
import { DashboardLayout } from './DashboardLayout';
import { StoriesManager } from './StoriesManager';
import { StoryBuilderV2 } from './StoryBuilderV2';

interface StoriesAppProps {
  /** MXH: gọi sau khi builder lưu thành công (id server) — vd để hỏi publish. */
  onSaved?: (storyId: string) => void;
  /** MXH: đóng toàn bộ trình thiết kế (nút X trên nav danh sách). */
  onClose?: () => void;
}

export const StoriesApp: React.FC<StoriesAppProps> = ({ onSaved, onClose }) => {
  const [mode, setMode] = useState<'list' | 'builder'>('list');
  const [currentStory, setCurrentStory] = useState<Story | null>(null);

  if (mode === 'builder') {
    return (
      <div className="h-screen w-full overflow-hidden bg-paper text-ink">
        <StoryBuilderV2
          initialStory={currentStory}
          onBack={() => {
            setCurrentStory(null);
            setMode('list');
          }}
          onSaved={onSaved}
        />
      </div>
    );
  }

  return (
    <DashboardLayout activeTab="stories" onClose={onClose}>
      <StoriesManager
        onCreateNew={() => {
          setCurrentStory(null);
          setMode('builder');
        }}
        onEdit={(story) => {
          setCurrentStory(story);
          setMode('builder');
        }}
      />
    </DashboardLayout>
  );
};
