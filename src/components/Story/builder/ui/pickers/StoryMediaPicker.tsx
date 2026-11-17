import { CheckCircle2, FolderOpen, Image, Loader2, Music, Upload, Video, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import { uploadStoryMedia } from '../../services/api';

type MediaType = 'image' | 'audio' | 'video';

interface ExistingMedia {
  name: string;
  path: string;
  url: string;
}

interface StoryMediaPickerProps {
  value: string;
  onChange: (value: string) => void;
  mediaType: MediaType;
  label?: string;
}

// Media type configurations
const MEDIA_CONFIG = {
  image: {
    accept: 'image/*',
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'],
    icon: Image,
    prefix: 'story-img',
    maxSize: 10 * 1024 * 1024,
  },
  audio: {
    accept: 'audio/*',
    extensions: ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac'],
    icon: Music,
    prefix: 'story-audio',
    maxSize: 20 * 1024 * 1024,
  },
  video: {
    accept: 'video/*',
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    icon: Video,
    prefix: 'story-video',
    maxSize: 50 * 1024 * 1024,
  },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function uploadMedia(file: File): Promise<string> {
  return uploadStoryMedia(file);
}

export default function StoryMediaPicker({ value, onChange, mediaType, label }: StoryMediaPickerProps) {
  const config = MEDIA_CONFIG[mediaType];
  const MediaIcon = config.icon;
  const defaultLabel = mediaType === 'image' ? 'Hình ảnh' : mediaType === 'audio' ? 'Âm thanh' : 'Video';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'library'>('upload');
  const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [tempUrl, setTempUrl] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setTempUrl(value);
  }, [value]);

  // Cleanup audio preview on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current = null;
      }
    };
  }, []);

  // Load existing media
  const loadExistingMedia = async () => {
    setIsLoadingMedia(false);
    setExistingMedia([]);
  };

  useEffect(() => {
    if (isModalOpen && activeTab === 'library') {
      loadExistingMedia();
    }
  }, [isModalOpen, activeTab]);

  // Get preview URL
  const getPreviewUrl = useCallback((url: string) => {
    return resolveMediaUrl(url);
  }, []);

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
    if (!config.extensions.some((e) => ext.endsWith(e.slice(1)))) {
      alert(`Vui lòng chọn file ${mediaType}!`);
      return;
    }

    if (file.size > config.maxSize) {
      alert(`File quá lớn! Vui lòng chọn file nhỏ hơn ${formatFileSize(config.maxSize)}.`);
      return;
    }

    setIsUploading(true);
    setUploadProgress('Đang tải lên...');

    try {
      const mediaPath = await uploadMedia(file);
      setTempUrl(mediaPath);
      setUploadProgress('Tải lên thành công!');
      setTimeout(() => setUploadProgress(''), 2000);
    } catch (error) {
      const err = error as Error;
      alert(`Tải lên thất bại: ${err.message}`);
      setUploadProgress('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    onChange(tempUrl);
    setIsModalOpen(false);
  };

  const handleClear = () => {
    setTempUrl('');
    onChange('');
  };

  // Render preview based on media type
  const renderPreview = (url: string, small = false) => {
    const previewUrl = getPreviewUrl(url);
    if (!previewUrl) return null;

    if (mediaType === 'image') {
      return (
        <img
          src={previewUrl}
          alt="Preview"
          className={`${small ? 'w-full h-full' : 'max-h-48'} object-contain`}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" text-anchor="middle" fill="%23666">Error</text></svg>';
          }}
        />
      );
    }

    if (mediaType === 'audio') {
      return (
        <div className={`flex items-center justify-center ${small ? 'w-full h-full' : 'w-full'}`}>
          {small ? <Music className="w-8 h-8 text-accent-bright" /> : <audio controls src={previewUrl} className="w-full" />}
        </div>
      );
    }

    if (mediaType === 'video') {
      return (
        <video
          src={previewUrl}
          className={`${small ? 'w-full h-full object-cover' : 'max-h-48 w-full'}`}
          controls={!small}
          muted
        />
      );
    }

    return null;
  };

  return (
    <div className="space-y-2">
      {/* Current Media Preview / Select Button */}
      <div
        onClick={() => setIsModalOpen(true)}
        className="relative w-full h-24 border-2 border-dashed border-line rounded-lg cursor-pointer hover:border-accent transition-colors overflow-hidden"
      >
        {value ? (
          <>
            <div className="w-full h-full flex items-center justify-center bg-surface">
              {renderPreview(value, true)}
            </div>
            <div className="absolute inset-0 bg-ink/80 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-ink text-sm">Nhấn để thay đổi</span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted">
            <MediaIcon className="w-8 h-8 mb-1" />
            <span className="text-xs">Chọn {defaultLabel.toLowerCase()}</span>
          </div>
        )}
      </div>

      {value && (
        <button onClick={handleClear} className="w-full py-1 text-xs text-danger hover:text-red-300">
          Xóa {defaultLabel.toLowerCase()}
        </button>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80">
          <div className="bg-surface rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-line">
              <h3 className="text-lg font-semibold text-ink">{label || defaultLabel}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-line rounded">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-line">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'upload'
                    ? 'text-accent-bright border-b-2 border-accent'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
              <button
                onClick={() => setActiveTab('library')}
                className={`flex-1 py-3 text-sm font-medium ${
                  activeTab === 'library'
                    ? 'text-accent-bright border-b-2 border-accent'
                    : 'text-muted hover:text-ink'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                Thư viện
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4">
              {activeTab === 'upload' && (
                <div className="space-y-4">
                  {/* Drop Zone */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragging ? 'border-accent bg-accent/10' : 'border-line hover:border-line'
                    }`}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-accent-bright animate-spin" />
                        <span className="text-ink">{uploadProgress}</span>
                      </div>
                    ) : (
                      <>
                        <MediaIcon className="w-12 h-12 text-muted mx-auto mb-3" />
                        <p className="text-ink mb-2">Kéo thả {defaultLabel.toLowerCase()} vào đây</p>
                        <p className="text-muted text-sm mb-4">hoặc</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-accent-ink rounded-full cursor-pointer transition-colors">
                          <Upload className="w-4 h-4" />
                          Chọn file
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={config.accept}
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                        </label>
                        <p className="text-muted text-xs mt-3">
                          {config.extensions.join(', ').toUpperCase()} (tối đa {formatFileSize(config.maxSize)})
                        </p>
                      </>
                    )}
                  </div>

                  {/* URL Input */}
                  <div>
                    <label className="block text-sm text-muted mb-2">Hoặc nhập URL</label>
                    <input
                      type="text"
                      value={tempUrl}
                      onChange={(e) => setTempUrl(e.target.value)}
                      placeholder={`https://example.com/${mediaType}.${config.extensions[0].slice(1)}`}
                      className="w-full px-3 py-2 bg-line border border-line rounded-lg text-ink placeholder:text-muted focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Preview */}
                  {tempUrl && (
                    <div>
                      <label className="block text-sm text-muted mb-2">Preview</label>
                      <div className="relative rounded-lg overflow-hidden bg-paper p-4 flex items-center justify-center">
                        {renderPreview(tempUrl)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'library' && (
                <div>
                  {isLoadingMedia ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-accent-bright animate-spin" />
                    </div>
                  ) : existingMedia.length === 0 ? (
                    <div className="text-center py-12 text-muted">
                      <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Chưa có {defaultLabel.toLowerCase()} nào</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {existingMedia.map((media) => (
                        <button
                          key={media.path}
                          onClick={() => setTempUrl(media.path)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            tempUrl === media.path ? 'border-accent' : 'border-transparent hover:border-line'
                          }`}
                        >
                          <div className="w-full h-full bg-line flex items-center justify-center">
                            {mediaType === 'image' ? (
                              <img
                                src={media.url || getPreviewUrl(media.path)}
                                alt={media.name}
                                className="w-full h-full object-cover"
                              />
                            ) : mediaType === 'audio' ? (
                              <Music className="w-12 h-12 text-muted" />
                            ) : (
                              <Video className="w-12 h-12 text-muted" />
                            )}
                          </div>
                          {tempUrl === media.path && (
                            <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-accent-bright" />
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                            <p className="text-xs text-ink truncate">{media.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-line">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-muted hover:text-ink transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={!tempUrl}
                className="px-4 py-2 bg-accent hover:bg-accent/90 disabled:bg-line disabled:cursor-not-allowed text-accent-ink rounded-full transition-colors"
              >
                Chọn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export specific pickers for convenience
export function StoryImagePicker(props: Omit<StoryMediaPickerProps, 'mediaType'>) {
  return <StoryMediaPicker {...props} mediaType="image" />;
}

export function StoryAudioPicker(props: Omit<StoryMediaPickerProps, 'mediaType'>) {
  return <StoryMediaPicker {...props} mediaType="audio" />;
}

export function StoryVideoPicker(props: Omit<StoryMediaPickerProps, 'mediaType'>) {
  return <StoryMediaPicker {...props} mediaType="video" />;
}
