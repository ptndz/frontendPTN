import React, { useState, useRef, useCallback } from 'react';
import {
  AtSign,
  BarChart3,
  CheckCircle2,
  Code2,
  Divide,
  Hash,
  LayoutTemplate,
  Link2,
  List,
  Loader2,
  MapPin,
  MousePointerClick,
  Music,
  Play,
  QrCode,
  Quote,
  Search,
  SlidersHorizontal,
  Square,
  Star,
  Sticker,
  Timer,
  Type,
  User,
  Video,
  X,
  Circle,
  Triangle,
  Diamond,
  Pentagon,
  Hexagon,
  Octagon,
  Heart,
  ArrowRight,
  Plus,
  Zap,
  Minus,
  MessageCircle,
  Cloud,
  Moon,
  Sun,
} from 'lucide-react';
import { uploadMediaLocally } from '../utils/media';
import { StoryImagePicker } from '../ui/pickers';
import type { ElementType, ShapeType, StoryTemplate } from '../types';

/**
 * MobileResourcesPanel Component
 * 
 * A mobile-optimized resources panel that appears as a full-screen modal.
 * Features:
 * - Horizontal scrollable category tabs
 * - Sticky search input
 * - Auto-close on resource selection
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.5
 */

export interface MobileResourcesPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Callback when an element is added */
  onAddElement: (type: ElementType, content: string, extra?: Record<string, unknown>) => void;
  /** Callback when a template is applied */
  onApplyTemplate?: (template: StoryTemplate) => void;
}

type TabType = 'elements' | 'shapes' | 'stickers' | 'templates' | 'audio' | 'interactive' | 'social';

// Shape definitions
const SHAPES: { type: ShapeType; icon: React.ReactNode; label: string }[] = [
  { type: 'rectangle', icon: <Square size={24} />, label: 'Hình chữ nhật' },
  { type: 'circle', icon: <Circle size={24} />, label: 'Hình tròn' },
  { type: 'triangle', icon: <Triangle size={24} />, label: 'Tam giác' },
  { type: 'diamond', icon: <Diamond size={24} />, label: 'Hình thoi' },
  { type: 'pentagon', icon: <Pentagon size={24} />, label: 'Ngũ giác' },
  { type: 'hexagon', icon: <Hexagon size={24} />, label: 'Lục giác' },
  { type: 'octagon', icon: <Octagon size={24} />, label: 'Bát giác' },
  { type: 'star', icon: <Star size={24} />, label: 'Ngôi sao' },
  { type: 'heart', icon: <Heart size={24} />, label: 'Trái tim' },
  { type: 'arrow', icon: <ArrowRight size={24} />, label: 'Mũi tên' },
  { type: 'plus', icon: <Plus size={24} />, label: 'Dấu cộng' },
  { type: 'cross', icon: <Zap size={24} />, label: 'Dấu chéo' },
  { type: 'line', icon: <Minus size={24} />, label: 'Đường thẳng' },
  { type: 'speech-bubble', icon: <MessageCircle size={24} />, label: 'Bong bóng thoại' },
  { type: 'cloud', icon: <Cloud size={24} />, label: 'Đám mây' },
  { type: 'moon', icon: <Moon size={24} />, label: 'Mặt trăng' },
  { type: 'sun', icon: <Sun size={24} />, label: 'Mặt trời' },
];

// Built-in stickers
const STICKERS = [
  '🔥', '⭐', '❤️', '👍', '🎉', '✨', '💯', '🚀',
  '😊', '😂', '🥰', '😎', '🤔', '👀', '💪', '🙌',
  '🎵', '🎨', '📸', '💡', '🏆', '🎯', '💥', '🌟',
  '🍕', '🍔', '☕', '🍩', '🎂', '🍦', '🥤', '🧁',
  '🎬', '📱', '💻', '🎮', '🎸', '🎤', '📷', '🖼️',
  '🎁', '💎', '👑', '🦋', '🌈', '☀️', '🌙', '⚡',
];

// Tab configuration
const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'elements', label: 'Thành phần', icon: <Type size={18} /> },
  { id: 'shapes', label: 'Hình', icon: <Square size={18} /> },
  { id: 'interactive', label: 'Tương tác', icon: <SlidersHorizontal size={18} /> },
  { id: 'social', label: 'Mạng xã hội', icon: <AtSign size={18} /> },
  { id: 'stickers', label: 'Nhãn dán', icon: <Sticker size={18} /> },
  { id: 'templates', label: 'Mẫu', icon: <LayoutTemplate size={18} /> },
  { id: 'audio', label: 'Âm thanh', icon: <Music size={18} /> },
];

export const MobileResourcesPanel: React.FC<MobileResourcesPanelProps> = ({
  isOpen,
  onClose,
  onAddElement,
  onApplyTemplate: _onApplyTemplate,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('elements');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadType) return;

    setIsUploading(true);
    try {
      const path = await uploadMediaLocally(file);
      handleAddElement(uploadType, path);
    } catch (error) {
      console.error(error);
      alert('Tải tệp lên thất bại');
    } finally {
      setIsUploading(false);
      setUploadType(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (type: 'image' | 'video') => {
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : 'video/*';
      fileInputRef.current.click();
    }
  };

  // Handle adding element with auto-close (Requirement 5.3)
  const handleAddElement = useCallback((
    type: ElementType, 
    content: string, 
    extra?: Record<string, unknown>
  ) => {
    onAddElement(type, content, extra);
    // Auto-close panel after selection
    setTimeout(() => {
      onClose();
    }, 150);
  }, [onAddElement, onClose]);

  // Handle image selection from picker
  const handleImageSelect = useCallback((path: string) => {
    if (path) {
      handleAddElement('image', path);
    }
  }, [handleAddElement]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-paper flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Thêm tài nguyên"
    >
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden" 
      />

      {/* Header with close button and search (sticky) */}
      <div className="flex-shrink-0 bg-paper border-b border-line sticky top-0 z-10">
        {/* Title bar */}
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-lg font-semibold text-ink">Thêm thành phần</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-muted hover:text-ink hover:bg-line rounded-full transition-colors"
            style={{ minWidth: '44px', minHeight: '44px' }}
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search input (sticky - Requirement 5.5) */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search 
              size={20} 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" 
            />
            <input
              type="text"
              placeholder="Tìm tài nguyên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-line rounded-xl pl-12 pr-4 py-3 text-base text-ink placeholder:text-muted focus:outline-none focus:border-accent"
              style={{ minHeight: '48px' }}
            />
          </div>
        </div>

        {/* Horizontal scrollable tabs (Requirement 5.2) */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex px-4 pb-2 gap-2 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-accent text-accent-ink'
                    : 'bg-surface text-muted hover:bg-line'
                }`}
                style={{ minHeight: '44px' }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto overscroll-contain p-4">
        {/* Elements Tab */}
        {activeTab === 'elements' && (
          <ElementsTabContent
            onAddElement={handleAddElement}
            onImageSelect={handleImageSelect}
            onTriggerUpload={triggerUpload}
            isUploading={isUploading}
            uploadType={uploadType}
          />
        )}

        {/* Shapes Tab */}
        {activeTab === 'shapes' && (
          <ShapesTabContent onAddElement={handleAddElement} />
        )}

        {/* Stickers Tab */}
        {activeTab === 'stickers' && (
          <StickersTabContent onAddElement={handleAddElement} />
        )}

        {/* Interactive Tab */}
        {activeTab === 'interactive' && (
          <InteractiveTabContent onAddElement={handleAddElement} />
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <SocialTabContent onAddElement={handleAddElement} />
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <TemplatesTabContent />
        )}

        {/* Audio Tab */}
        {activeTab === 'audio' && (
          <AudioTabContent />
        )}
      </div>
    </div>
  );
};


// ============================================
// Elements Tab Content
// ============================================
interface ElementsTabContentProps {
  onAddElement: (type: ElementType, content: string, extra?: Record<string, unknown>) => void;
  onImageSelect: (path: string) => void;
  onTriggerUpload: (type: 'image' | 'video') => void;
  isUploading: boolean;
  uploadType: 'image' | 'video' | null;
}

const ElementsTabContent: React.FC<ElementsTabContentProps> = ({
  onAddElement,
  onImageSelect,
  onTriggerUpload,
  isUploading,
  uploadType,
}) => (
  <div className="space-y-6">
    {/* Thành phần cơ bản */}
    <div>
      <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
        Thành phần cơ bản
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <ElementButton
          icon={<Type size={28} className="text-ink" />}
          label="Chữ"
          onClick={() => onAddElement('text', 'Chữ mới')}
        />
        
        <div className="flex flex-col items-center justify-center p-4 bg-surface rounded-xl border border-line min-h-[100px]">
          <StoryImagePicker 
            value="" 
            onChange={onImageSelect}
          />
        </div>

        <ElementButton
          icon={
            isUploading && uploadType === 'video' 
              ? <Loader2 size={28} className="text-success animate-spin" />
              : <Video size={28} className="text-success" />
          }
          label="Video"
          onClick={() => onTriggerUpload('video')}
          disabled={isUploading}
        />

        <ElementButton
          icon={<Square size={28} className="text-warning" />}
          label="Hình"
          onClick={() => onAddElement('shape', '', { shapeType: 'rectangle' })}
        />

        <ElementButton
          icon={<MousePointerClick size={28} className="text-accent-bright" />}
          label="Nút bấm"
          onClick={() => onAddElement('button', 'Bấm vào đây', {
            button: { href: '#', target: '_self', variant: 'primary' },
            style: {
              width: 160,
              height: 48,
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: 16,
              fontWeight: 'semibold',
              borderRadius: 8,
              textAlign: 'center',
            },
          })}
        />

        <ElementButton
          icon={<Divide size={28} className="text-muted" />}
          label="Đường kẻ"
          onClick={() => onAddElement('divider', '', {
            divider: { style: 'solid', thickness: 2 },
            style: {
              width: 280,
              height: 4,
              backgroundColor: '#ffffff',
              opacity: 0.3,
            },
          })}
        />

        <ElementButton
          icon={<Quote size={28} className="text-warning" />}
          label="Trích dẫn"
          onClick={() => onAddElement('quote', '"Your quote here"', {
            quote: { author: 'Tên tác giả', style: 'decorative' },
            style: {
              width: 280,
              height: 150,
              color: '#ffffff',
              fontSize: 20,
              fontStyle: 'italic',
              textAlign: 'center',
            },
          })}
        />

        <ElementButton
          icon={<List size={28} className="text-cyan-400" />}
          label="Danh sách"
          onClick={() => onAddElement('list', '', {
            list: { items: ['Mục 1', 'Mục 2', 'Mục 3'], type: 'bullet' },
            style: {
              width: 250,
              height: 120,
              color: '#ffffff',
              fontSize: 16,
              textAlign: 'left',
            },
          })}
        />

        <ElementButton
          icon={<User size={28} className="text-indigo-400" />}
          label="Ảnh đại diện"
          onClick={() => onAddElement('avatar', '', {
            avatar: { name: 'Tên người dùng', subtitle: '@username', size: 'lg', shape: 'circle' },
            style: {
              width: 200,
              height: 80,
              backgroundColor: '#3b82f6',
            },
          })}
        />
      </div>
    </div>

    {/* Thêm chữ nhanh */}
    <div>
      <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
        Thêm chữ nhanh
      </h4>
      <div className="space-y-2">
        <QuickAddButton
          label="Tiêu đề"
          className="text-2xl font-bold"
          onClick={() => onAddElement('text', 'TIÊU ĐỀ', {
            style: { fontSize: 48, fontWeight: 'bold' },
          })}
        />
        <QuickAddButton
          label="Tiêu đề phụ"
          className="text-lg font-medium"
          onClick={() => onAddElement('text', 'Tiêu đề phụ', {
            style: { fontSize: 24, fontWeight: 'medium' },
          })}
        />
        <QuickAddButton
          label="Nội dung ở đây..."
          className="text-base"
          onClick={() => onAddElement('text', 'Body text goes here...', {
            style: { fontSize: 16, fontWeight: 'normal' },
          })}
        />
        <QuickAddButton
          label="Chú thích"
          className="text-sm opacity-70"
          onClick={() => onAddElement('text', 'Chú thích', {
            style: { fontSize: 12, fontWeight: 'normal', opacity: 0.7 },
          })}
        />
      </div>
    </div>
  </div>
);

// ============================================
// Shapes Tab Content
// ============================================
interface ShapesTabContentProps {
  onAddElement: (type: ElementType, content: string, extra?: Record<string, unknown>) => void;
}

const ShapesTabContent: React.FC<ShapesTabContentProps> = ({ onAddElement }) => (
  <div>
    <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
      Shapes
    </h4>
    <div className="grid grid-cols-4 gap-3">
      {SHAPES.map((shape) => (
        <button
          key={shape.type}
          onClick={() => onAddElement('shape', '', { shapeType: shape.type })}
          className="flex flex-col items-center justify-center p-3 bg-surface hover:bg-line rounded-xl border border-line transition-colors"
          style={{ minHeight: '80px' }}
        >
          <span className="text-accent-bright mb-1">{shape.icon}</span>
          <span className="text-xs text-muted">{shape.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// ============================================
// Stickers Tab Content
// ============================================
interface StickersTabContentProps {
  onAddElement: (type: ElementType, content: string, extra?: Record<string, unknown>) => void;
}

const StickersTabContent: React.FC<StickersTabContentProps> = ({ onAddElement }) => (
  <div>
    <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
      Nhãn dán emoji
    </h4>
    <div className="grid grid-cols-6 gap-2">
      {STICKERS.map((sticker, index) => (
        <button
          key={index}
          onClick={() => onAddElement('sticker', sticker, {
            style: { fontSize: 48, width: 60, height: 60 },
          })}
          className="flex items-center justify-center p-3 bg-surface hover:bg-line rounded-xl border border-line transition-colors text-3xl"
          style={{ minHeight: '60px', minWidth: '60px' }}
        >
          {sticker}
        </button>
      ))}
    </div>
  </div>
);

// ============================================
// Interactive Tab Content
// ============================================
interface InteractiveTabContentProps {
  onAddElement: (type: ElementType, content: string, extra?: Record<string, unknown>) => void;
}

const InteractiveTabContent: React.FC<InteractiveTabContentProps> = ({ onAddElement }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
        Thành phần tương tác
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <ElementButton
          icon={<BarChart3 size={28} className="text-accent-bright" />}
          label="Bình chọn"
          onClick={() => onAddElement('poll', '', {
            poll: { question: 'Câu hỏi của bạn?', options: ['Lựa chọn 1', 'Lựa chọn 2'] },
            style: { width: 280, height: 200 },
          })}
        />
        <ElementButton
          icon={<Timer size={28} className="text-orange-400" />}
          label="Đếm ngược"
          onClick={() => onAddElement('countdown', '', {
            countdown: { targetDate: new Date(Date.now() + 86400000).toISOString(), label: 'Event' },
            style: { width: 280, height: 100 },
          })}
        />
        <ElementButton
          icon={<Star size={28} className="text-warning" />}
          label="Đánh giá"
          onClick={() => onAddElement('rating', '', {
            rating: { value: 4, max: 5, icon: 'star', showValue: true },
            style: { width: 200, height: 50 },
          })}
        />
        <ElementButton
          icon={<SlidersHorizontal size={28} className="text-success" />}
          label="Tiến độ"
          onClick={() => onAddElement('progress', '', {
            progress: { value: 75, max: 100, label: 'Tiến độ', showPercent: true, variant: 'bar' },
            style: { width: 280, height: 60 },
          })}
        />
        <ElementButton
          icon={<Play size={28} className="text-danger" />}
          label="Đồng hồ"
          onClick={() => onAddElement('timer', '', {
            timer: { duration: 60, autoStart: false, showLabels: true, format: 'ms' },
            style: { width: 200, height: 80 },
          })}
        />
        <ElementButton
          icon={<QrCode size={28} className="text-accent-bright" />}
          label="Mã QR"
          onClick={() => onAddElement('qrcode', '', {
            qrcode: { data: 'https://example.com', size: 150 },
            style: { width: 150, height: 150 },
          })}
        />
      </div>
    </div>
  </div>
);

// ============================================
// Social Tab Content
// ============================================
interface SocialTabContentProps {
  onAddElement: (type: ElementType, content: string, extra?: Record<string, unknown>) => void;
}

const SocialTabContent: React.FC<SocialTabContentProps> = ({ onAddElement }) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">
        Thành phần mạng xã hội
      </h4>
      <div className="grid grid-cols-3 gap-3">
        <ElementButton
          icon={<AtSign size={28} className="text-ink" />}
          label="Nhắc đến"
          onClick={() => onAddElement('mention', '', {
            mention: { username: 'username', platform: 'instagram', verified: false },
            style: { width: 180, height: 40, fontSize: 16 },
          })}
        />
        <ElementButton
          icon={<Hash size={28} className="text-accent-bright" />}
          label="Hashtag"
          onClick={() => onAddElement('hashtag', '', {
            hashtag: { tags: ['hashtag1', 'hashtag2'], clickable: true },
            style: { width: 200, height: 40, fontSize: 14 },
          })}
        />
        <ElementButton
          icon={<Link2 size={28} className="text-success" />}
          label="Liên kết"
          onClick={() => onAddElement('link', 'Bấm vào đây', {
            link: { url: 'https://example.com', label: 'Bấm vào đây' },
            style: { width: 150, height: 40, color: '#3b82f6', fontSize: 16 },
          })}
        />
        <ElementButton
          icon={<MapPin size={28} className="text-danger" />}
          label="Địa điểm"
          onClick={() => onAddElement('location', '', {
            location: { name: 'Tên địa điểm', address: '123 Đường' },
            style: { width: 200, height: 60 },
          })}
        />
        <ElementButton
          icon={<Code2 size={28} className="text-emerald-400" />}
          label="Mã"
          onClick={() => onAddElement('codeblock', 'const hello = "world";', {
            codeblock: { language: 'javascript', theme: 'dark', showLineNumbers: true },
            style: {
              width: 280,
              height: 100,
              backgroundColor: '#1e1e1e',
              color: '#d4d4d4',
              fontSize: 14,
              fontFamily: 'monospace',
              borderRadius: 8,
            },
          })}
        />
        <ElementButton
          icon={<CheckCircle2 size={28} className="text-teal-400" />}
          label="Danh sách kiểm"
          onClick={() => onAddElement('list', '', {
            list: { items: ['Task 1', 'Task 2', 'Task 3'], type: 'checklist' },
            style: { width: 250, height: 120, color: '#ffffff', fontSize: 16 },
          })}
        />
      </div>
    </div>
  </div>
);

// ============================================
// Templates Tab Content
// ============================================
const TemplatesTabContent: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <LayoutTemplate size={48} className="text-muted mb-4" />
    <h4 className="text-lg font-medium text-muted mb-2">Mẫu</h4>
    <p className="text-sm text-muted">
      Mẫu sắp ra mắt. Xem các thiết kế story có sẵn.
    </p>
  </div>
);

// ============================================
// Audio Tab Content
// ============================================
const AudioTabContent: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Music size={48} className="text-muted mb-4" />
    <h4 className="text-lg font-medium text-muted mb-2">Âm thanh</h4>
    <p className="text-sm text-muted">
      Thêm nhạc nền cho story từ timeline.
    </p>
  </div>
);

// ============================================
// Helper Components
// ============================================
interface ElementButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const ElementButton: React.FC<ElementButtonProps> = ({ 
  icon, 
  label, 
  onClick, 
  disabled = false 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="flex flex-col items-center justify-center p-4 bg-surface hover:bg-line rounded-xl border border-line transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    style={{ minHeight: '100px' }}
  >
    <span className="mb-2">{icon}</span>
    <span className="text-sm font-medium text-ink">{label}</span>
  </button>
);

interface QuickAddButtonProps {
  label: string;
  className?: string;
  onClick: () => void;
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({ 
  label, 
  className = '', 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 bg-surface hover:bg-line rounded-xl transition-colors text-ink ${className}`}
    style={{ minHeight: '52px' }}
  >
    {label}
  </button>
);

export default MobileResourcesPanel;
