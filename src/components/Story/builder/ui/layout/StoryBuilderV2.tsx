// @ffmpeg/ffmpeg is imported dynamically to prevent Rollup from bundling WASM at build time
import { Download, Film, Play, Plus, Redo2, Undo2 } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

// Hooks
import { useStoryBuilder } from '../../hooks/useStoryBuilder';
import { useStoryKeyboard } from '../../hooks/useStoryKeyboard';
import { useStoryPlayback } from '../../hooks/useStoryPlayback';

// Services
import { exportStoryAsJSON } from '../../services/storiesService';
import { saveStory } from '../../services/storySave';
import { renderWithFFmpeg, renderWithWebCodecs, type RenderCallbacks } from '../../services/videoRenderer';
// Components
import { DEFAULT_EXPORT_SETTINGS, ExportSettingsModal, type ExportSettings } from '../modals';
import { SettingsModal } from '../modals/SettingsModal';
import { AudioPanel, LayersPanel, PropertiesPanelV2, ResourcePanelV2 } from '../panels';
import { StoryPreviewV2 } from '../preview';
import { TimelineV2 } from '../timeline';
import { RenderOverlay, StoryBuilderHeader, StoryCanvas } from './components';

// Mobile components
import { Copy, Grid3X3, Layers, Music2, PanelLeft, Settings, Trash2 } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import {
  BottomNavBar,
  BottomSheet,
  CompactTimeline,
  FloatingActionButton,
  MobileHeader,
  MobilePropertiesPanel,
  MobileResourcesPanel,
  SwipeNavigator,
  TouchCanvas,
  type MenuItem,
  type NavTab,
} from '../../mobile';
import { CanvasElement } from '../canvas';

import type { Story } from '../../types';

interface StoryBuilderProps {
  initialStory?: Story | null;
  onBack?: () => void;
  /**
   * MXH: gọi sau khi lưu thành công với id server. Caller (vd modal MXH)
   * dùng id này để hỏi đăng story (publish). Không có onSaved -> giữ hành
   * vi gốc: alert + onBack.
   */
  onSaved?: (storyId: string) => void;
}

/**
 * StoryBuilderV2 - Main Story Builder component
 */
export function StoryBuilderV2({ initialStory, onBack, onSaved }: StoryBuilderProps) {
  // Core story state
  const storyBuilder = useStoryBuilder({ initialStory });
  const {
    story,
    setStory,
    currentSlide,
    currentSlideId,
    setCurrentSlideId,
    currentSlideIndex,
    selectedElementIds,
    setSelectedElementIds,
    selectedElement,
    canvasState,
    setCanvasState,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    undo,
    redo,
    canUndo,
    canRedo,
    updateSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    toggleElementLock,
    toggleElementVisibility,
    reorderElements,
    applyTemplate,
  } = storyBuilder;

  // Playback state
  const playback = useStoryPlayback({ currentSlide, story, currentSlideId });
  const { currentTime, setCurrentTime, isPlaying, togglePlay } = playback;

  // UI state
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewStartIndex, setPreviewStartIndex] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportSettings, setExportSettings] = useState<ExportSettings>(DEFAULT_EXPORT_SETTINGS);
  const [leftPanelTab, setLeftPanelTab] = useState<'resources' | 'layers' | 'audio'>('resources');
  const [animationTrigger, setAnimationTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Render state
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [renderTime, setRenderTime] = useState(0);
  const ffmpegRef = useRef<any>(null);

  // Mobile state
  const { isMobile } = useResponsive();
  const [mobileActiveTab, setMobileActiveTab] = useState<string>('canvas');
  const [showMobileResources, setShowMobileResources] = useState(false);
  const [showMobileProperties, setShowMobileProperties] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useStoryKeyboard({
    undo,
    redo,
    selectedElementIds,
    deleteElement,
    duplicateElement,
    setSelectedElementIds,
    setIsPreviewMode,
    setPreviewStartIndex,
    currentSlideIndex,
  });

  // Mobile nav tabs
  const mobileNavTabs: NavTab[] = [
    { id: 'canvas', label: 'Khung vẽ', icon: <Grid3X3 size={20} /> },
    { id: 'layers', label: 'Lớp', icon: <Layers size={20} /> },
    { id: 'settings', label: 'Cài đặt', icon: <Settings size={20} /> },
  ];

  // Mobile menu items
  const mobileMenuItems: MenuItem[] = [
    {
      id: 'preview',
      label: 'Xem trước',
      icon: <Play size={18} />,
      onClick: () => {
        setPreviewStartIndex(currentSlideIndex);
        setIsPreviewMode(true);
      },
    },
    { id: 'export-json', label: 'Xuất JSON', icon: <Download size={18} />, onClick: () => exportStoryAsJSON(story) },
    { id: 'export-video', label: 'Xuất video', icon: <Film size={18} />, onClick: () => setShowExportModal(true) },
  ];

  // Handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isEditingExisting = Boolean(initialStory?.id);
      const result = await saveStory(story, isEditingExisting);
      if (result.success) {
        setHasUnsavedChanges(false);
        // MXH: đồng bộ id server vào state (id local 'story-...' không tồn
        // tại trên server; lưu lần sau phải dùng id này nếu không PUT 404).
        if (result.id && result.id !== story.id) {
          setStory((prev: any) => (prev ? { ...prev, id: result.id } : prev));
        }
        if (onSaved) {
          onSaved(result.id ?? story.id);
          if (onBack) onBack();
        } else {
          alert('Lưu Story thành công!');
          if (onBack) onBack();
        }
      } else {
        alert(result.error || 'Lưu thất bại');
      }
    } catch (error) {
      alert('Lưu thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn đóng Studio Tin?')) {
      return;
    }
    if (onBack) onBack();
  }, [hasUnsavedChanges, onBack]);

  const handleRenderVideo = async (settings: ExportSettings) => {
    const callbacks: RenderCallbacks = {
      setIsRendering,
      setRenderProgress,
      setLoadingStatus,
      setRenderTime,
      setCurrentSlideId,
    };

    try {
      await renderWithWebCodecs(story, currentSlide, settings, ffmpegRef, callbacks);
    } catch (err) {
      console.error('Render failed:', err);
    } finally {
      setIsRendering(false);
      setLoadingStatus('');
    }
  };

  const handleImportStory = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string) as Story;
          setStory({ ...imported, id: `story-${Date.now()}`, updatedAt: new Date().toISOString() });
          if (imported.slides[0]) setCurrentSlideId(imported.slides[0].id);
          setSelectedElementIds([]);
        } catch {
          alert('Tệp story không hợp lệ');
        }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    [setStory, setCurrentSlideId, setSelectedElementIds]
  );

  // Mobile handlers
  const handleSwipeLeft = useCallback(() => {
    if (currentSlideIndex < story.slides.length - 1) {
      setCurrentSlideId(story.slides[currentSlideIndex + 1].id);
      setSelectedElementIds([]);
    }
  }, [currentSlideIndex, story.slides, setCurrentSlideId, setSelectedElementIds]);

  const handleSwipeRight = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideId(story.slides[currentSlideIndex - 1].id);
      setSelectedElementIds([]);
    }
  }, [currentSlideIndex, story.slides, setCurrentSlideId, setSelectedElementIds]);

  const handleMobileElementSelect = useCallback(
    (elementId: string) => {
      setSelectedElementIds([elementId]);
      if (isMobile) setShowMobileProperties(true);
    },
    [isMobile, setSelectedElementIds]
  );

  // Early return if story not ready
  if (!story || !story.slides || story.slides.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-paper text-ink">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent mx-auto"></div>
          <p>Loading Story Builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-paper text-ink">
      {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportStory} className="hidden" />

        {/* Render Overlay */}
        <RenderOverlay
          isRendering={isRendering}
          renderProgress={renderProgress}
          loadingStatus={loadingStatus}
          currentSlide={currentSlide}
          exportSettings={exportSettings}
          renderTime={renderTime}
        />

        {/* Preview Mode */}
        {isPreviewMode && (
          <StoryPreviewV2
            story={story}
            onClose={() => setIsPreviewMode(false)}
            startSlideIndex={previewStartIndex}
          />
        )}

        {/* Mobile Layout */}
        {isMobile ? (
          <>
            <MobileHeader
              title={story.title}
              onBack={handleBack}
              onSave={handleSave}
              onMenuOpen={() => {}}
              hasUnsavedChanges={hasUnsavedChanges}
              isSaving={isSaving}
              menuItems={mobileMenuItems}
            />

            <div
              className="flex-1 flex flex-col overflow-hidden relative"
              style={{ paddingBottom: isTimelineExpanded ? '200px' : '112px' }}
            >
              <SwipeNavigator
                currentIndex={currentSlideIndex}
                totalSlides={story.slides.length}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                enabled={selectedElementIds.length === 0}
              >
                <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                  <TouchCanvas
                    slide={currentSlide}
                    selectedElementIds={selectedElementIds}
                    onElementSelect={handleMobileElementSelect}
                    onElementUpdate={(elementId, updates) => updateElement(elementId, updates)}
                    onPinchZoom={(elementId, scale) => {
                      const el = currentSlide.elements.find((e: any) => e.id === elementId);
                      if (el && !el.locked) {
                        updateElement(elementId, {
                          width: Math.max(20, el.style.width * scale),
                          height: Math.max(20, el.style.height * scale),
                        });
                      }
                    }}
                    onRotate={(elementId, angle) => {
                      const el = currentSlide.elements.find((e: any) => e.id === elementId);
                      if (el && !el.locked) {
                        updateElement(elementId, { rotation: (el.style.rotation || 0) + angle });
                      }
                    }}
                    onLongPress={(elementId, position) => {
                      setContextMenuPosition(position);
                      setSelectedElementIds([elementId]);
                    }}
                    onDoubleTap={(elementId) => {
                      const el = currentSlide.elements.find((e: any) => e.id === elementId);
                      if (el?.type === 'text') setShowMobileProperties(true);
                    }}
                    onCanvasTap={() => {
                      setShowFloatingToolbar(true);
                      setSelectedElementIds([]);
                      setTimeout(() => setShowFloatingToolbar(false), 3000);
                    }}
                    zoom={canvasState.zoom}
                    showGrid={canvasState.showGrid}
                    gridSize={canvasState.gridSize}
                    snapToGrid={canvasState.snapToGrid}
                  >
                    {/* Background */}
                    {currentSlide.background.type === 'color' && (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{ backgroundColor: currentSlide.background.value }}
                      />
                    )}
                    {currentSlide.background.type === 'gradient' && currentSlide.background.gradient && (
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          background:
                            currentSlide.background.gradient.type === 'radial'
                              ? `radial-gradient(circle, ${currentSlide.background.gradient.colors.map((c: any) => `${c.color} ${c.position}%`).join(', ')})`
                              : `linear-gradient(${currentSlide.background.gradient.angle || 0}deg, ${currentSlide.background.gradient.colors.map((c: any) => `${c.color} ${c.position}%`).join(', ')})`,
                        }}
                      />
                    )}
                    {currentSlide.background.type === 'image' && (
                      <img
                        src={resolveMediaUrl(currentSlide.background.value)}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt="slide-bg"
                      />
                    )}
                    {currentSlide.background.type === 'video' && (
                      <video
                        src={resolveMediaUrl(currentSlide.background.value)}
                        className="absolute inset-0 w-full h-full object-cover"
                        muted
                        loop
                        autoPlay
                      />
                    )}

                    {/* Elements */}
                    {currentSlide.elements.map((element: any) => (
                      <CanvasElement
                        key={element.id}
                        element={element}
                        isSelected={selectedElementIds.includes(element.id)}
                        currentTime={currentTime}
                        onSelect={(multiSelect) => {
                          if (multiSelect)
                            setSelectedElementIds((prev: any) =>
                              prev.includes(element.id) ? prev.filter((id: any) => id !== element.id) : [...prev, element.id]
                            );
                          else handleMobileElementSelect(element.id);
                        }}
                        onUpdate={(updates) => updateElement(element.id, updates)}
                        onDelete={() => deleteElement(element.id)}
                        onDuplicate={() => duplicateElement(element.id)}
                        onToggleLock={() => toggleElementLock(element.id)}
                        snapToGrid={canvasState.snapToGrid}
                        gridSize={canvasState.gridSize}
                        zoom={canvasState.zoom}
                        playAnimation={selectedElementIds.includes(element.id) && animationTrigger > 0}
                      />
                    ))}
                  </TouchCanvas>
                </div>
              </SwipeNavigator>

              {/* Floating Toolbar */}
              {showFloatingToolbar && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface rounded-full px-4 py-2 shadow-lg border border-line z-20">
                  <button
                    onClick={() => setShowMobileResources(true)}
                    className="p-2 text-ink hover:text-ink hover:bg-line rounded-full transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    onClick={undo}
                    disabled={!canUndo}
                    className={`p-2 rounded-full transition-colors ${!canUndo ? 'text-muted' : 'text-ink hover:text-ink hover:bg-line'}`}
                  >
                    <Undo2 size={20} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!canRedo}
                    className={`p-2 rounded-full transition-colors ${!canRedo ? 'text-muted' : 'text-ink hover:text-ink hover:bg-line'}`}
                  >
                    <Redo2 size={20} />
                  </button>
                </div>
              )}

              {/* Context Menu */}
              {contextMenuPosition && selectedElementIds.length === 1 && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setContextMenuPosition(null)} />
                  <div
                    className="absolute z-40 bg-surface rounded-xl shadow-xl border border-line py-2 min-w-[160px]"
                    style={{
                      left: Math.min(contextMenuPosition.x, window.innerWidth - 180),
                      top: Math.min(contextMenuPosition.y, window.innerHeight - 250),
                    }}
                  >
                    <button
                      onClick={() => {
                        duplicateElement(selectedElementIds[0]);
                        setContextMenuPosition(null);
                      }}
                      className="w-full px-4 py-3 text-left text-ink hover:bg-line flex items-center gap-3"
                    >
                      <Copy size={18} /> Duplicate
                    </button>
                    <button
                      onClick={() => {
                        toggleElementLock(selectedElementIds[0]);
                        setContextMenuPosition(null);
                      }}
                      className="w-full px-4 py-3 text-left text-ink hover:bg-line flex items-center gap-3"
                    >
                      <Layers size={18} />{' '}
                      {currentSlide.elements.find((el: any) => el.id === selectedElementIds[0])?.locked ? 'Mở khóa' : 'Khóa'}
                    </button>
                    <div className="border-t border-line my-1" />
                    <button
                      onClick={() => {
                        deleteElement(selectedElementIds[0]);
                        setContextMenuPosition(null);
                      }}
                      className="w-full px-4 py-3 text-left text-danger hover:bg-danger/10 flex items-center gap-3"
                    >
                      <Trash2 size={18} /> Delete
                    </button>
                  </div>
                </>
              )}

              <FloatingActionButton
                icon={<Plus size={24} />}
                onClick={() => setShowMobileResources(true)}
                position="bottom-right"
                size="large"
              />
            </div>

            <CompactTimeline
              currentTime={currentTime}
              duration={currentSlide.duration || 5}
              isExpanded={isTimelineExpanded}
              onTimeChange={setCurrentTime}
              onToggleExpand={() => setIsTimelineExpanded(!isTimelineExpanded)}
              slides={story.slides}
              currentSlideIndex={currentSlideIndex}
              onSlideSelect={(index) => {
                setCurrentSlideId(story.slides[index].id);
                setSelectedElementIds([]);
              }}
              isPlaying={isPlaying}
              onTogglePlay={togglePlay}
            />
            <BottomNavBar
              tabs={mobileNavTabs}
              activeTab={mobileActiveTab}
              onTabChange={(tabId) => {
                setMobileActiveTab(tabId);
                if (tabId === 'settings') setShowSettings(true);
              }}
            />
            <MobileResourcesPanel
              isOpen={showMobileResources}
              onClose={() => setShowMobileResources(false)}
              onAddElement={addElement}
              onApplyTemplate={applyTemplate}
            />
            <MobilePropertiesPanel
              isOpen={showMobileProperties}
              onClose={() => setShowMobileProperties(false)}
              element={selectedElement || null}
              slide={currentSlide}
              onUpdateElement={(updates) => {
                if (selectedElementIds.length === 1) updateElement(selectedElementIds[0], updates);
              }}
              onUpdateSlide={(updates) => updateSlide(currentSlideId, updates)}
              onDeleteElement={() => {
                if (selectedElement) {
                  deleteElement(selectedElement.id);
                  setShowMobileProperties(false);
                }
              }}
              onDuplicateElement={() => {
                if (selectedElement) duplicateElement(selectedElement.id);
              }}
              onToggleLock={() => {
                if (selectedElement) toggleElementLock(selectedElement.id);
              }}
            />
            <BottomSheet
              isOpen={mobileActiveTab === 'layers'}
              onClose={() => setMobileActiveTab('canvas')}
              title="Lớp"
              snapPoints={[0.5, 0.8]}
              initialSnap={0}
            >
              <LayersPanel
                elements={currentSlide.elements}
                selectedElementIds={selectedElementIds}
                onSelectElement={(id, multiSelect) => {
                  if (multiSelect)
                    setSelectedElementIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
                  else setSelectedElementIds([id]);
                }}
                onReorderElements={reorderElements}
                onToggleVisibility={toggleElementVisibility}
                onToggleLock={toggleElementLock}
                onDeleteElement={deleteElement}
                onDuplicateElement={duplicateElement}
              />
            </BottomSheet>
          </>
        ) : (
          <>
            {/* Desktop Header */}
            <StoryBuilderHeader
              story={story}
              onTitleChange={(title) => setStory((prev: any) => (prev ? { ...prev, title } : prev))}
              onBack={handleBack}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              canvasState={canvasState}
              onCanvasStateChange={(updates) => setCanvasState((prev) => ({ ...prev, ...updates }))}
              onPreview={() => {
                setPreviewStartIndex(currentSlideIndex);
                setIsPreviewMode(true);
              }}
              onImport={() => fileInputRef.current?.click()}
              onExportJSON={() => exportStoryAsJSON(story)}
              onExportVideo={() => setShowExportModal(true)}
              onOpenSettings={() => setShowSettings(true)}
              onSave={handleSave}
            />

            {/* Desktop Main Workspace */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left Panel */}
              <div className="w-72 border-r border-line flex flex-col">
                <div className="flex border-b border-line">
                  <button
                    onClick={() => setLeftPanelTab('resources')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${leftPanelTab === 'resources' ? 'bg-surface text-ink border-b-2 border-accent' : 'text-muted hover:text-ink hover:bg-surface/50'}`}
                  >
                    <PanelLeft size={14} /> Tài nguyên
                  </button>
                  <button
                    onClick={() => setLeftPanelTab('layers')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${leftPanelTab === 'layers' ? 'bg-surface text-ink border-b-2 border-accent' : 'text-muted hover:text-ink hover:bg-surface/50'}`}
                  >
                    <Layers size={14} /> Lớp
                  </button>
                  <button
                    onClick={() => setLeftPanelTab('audio')}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors ${leftPanelTab === 'audio' ? 'bg-surface text-ink border-b-2 border-accent' : 'text-muted hover:text-ink hover:bg-surface/50'}`}
                  >
                    <Music2 size={14} /> Âm thanh
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  {leftPanelTab === 'resources' ? (
                    <ResourcePanelV2 onAddElement={addElement} onApplyTemplate={applyTemplate} />
                  ) : leftPanelTab === 'layers' ? (
                    <LayersPanel
                      elements={currentSlide.elements}
                      selectedElementIds={selectedElementIds}
                      onSelectElement={(id, multiSelect) => {
                        if (multiSelect)
                          setSelectedElementIds((prev) =>
                            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
                          );
                        else setSelectedElementIds([id]);
                      }}
                      onReorderElements={reorderElements}
                      onToggleVisibility={toggleElementVisibility}
                      onToggleLock={toggleElementLock}
                      onDeleteElement={deleteElement}
                      onDuplicateElement={duplicateElement}
                    />
                  ) : (
                    <AudioPanel
                      story={story}
                      currentSlide={currentSlide}
                      onUpdateStory={(updates) => setStory((prev: any) => (prev ? { ...prev, ...updates } : prev))}
                      onUpdateSlide={updateSlide}
                    />
                  )}
                </div>
              </div>

              {/* Center Canvas */}
              <div className="flex-1 flex flex-col relative overflow-hidden bg-paper/50">
                <StoryCanvas
                  currentSlide={currentSlide}
                  canvasState={canvasState}
                  selectedElementIds={selectedElementIds}
                  currentTime={currentTime}
                  animationTrigger={animationTrigger}
                  onSelectElement={(id, multiSelect) => {
                    if (multiSelect)
                      setSelectedElementIds((prev: any) =>
                        prev.includes(id) ? prev.filter((i: any) => i !== id) : [...prev, id]
                      );
                    else setSelectedElementIds([id]);
                  }}
                  onUpdateElement={updateElement}
                  onDeleteElement={deleteElement}
                  onDuplicateElement={duplicateElement}
                  onToggleLock={toggleElementLock}
                  onDeselectAll={() => setSelectedElementIds([])}
                />

                {/* Timeline */}
                <div className="h-36 border-t border-line">
                  <TimelineV2
                    slides={story.slides}
                    currentSlideId={currentSlideId}
                    onSelectSlide={(id) => {
                      setCurrentSlideId(id);
                      setSelectedElementIds([]);
                    }}
                    onAddSlide={addSlide}
                    onReorderSlides={(newSlides) => setStory((prev: any) => (prev ? { ...prev, slides: newSlides } : prev))}
                    onDeleteSlide={deleteSlide}
                    onDuplicateSlide={duplicateSlide}
                    isPlaying={isPlaying}
                    onTogglePlay={togglePlay}
                    currentTime={currentTime}
                    onSeek={setCurrentTime}
                    elements={currentSlide.elements}
                    onUpdateElement={updateElement}
                    selectedElementIds={selectedElementIds}
                    onSelectElement={(id) => setSelectedElementIds([id])}
                  />
                </div>
              </div>

              {/* Right Properties Panel */}
              <div className="w-80 border-l border-line">
                <PropertiesPanelV2
                  element={selectedElement || null}
                  slide={currentSlide}
                  onUpdateElement={(updates) => {
                    if (selectedElementIds.length === 1) updateElement(selectedElementIds[0], updates);
                  }}
                  onUpdateSlide={(updates) => updateSlide(currentSlideId, updates)}
                  onDeleteElement={() => {
                    if (selectedElement) deleteElement(selectedElement.id);
                  }}
                  onDuplicateElement={() => {
                    if (selectedElement) duplicateElement(selectedElement.id);
                  }}
                  onToggleLock={() => {
                    if (selectedElement) toggleElementLock(selectedElement.id);
                  }}
                  onPreviewAnimation={() => setAnimationTrigger((prev: any) => prev + 1)}
                />
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          story={story}
          onUpdateStory={(updates) => setStory((prev: any) => (prev ? { ...prev, ...updates } : prev))}
        />
        <ExportSettingsModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={(settings) => {
            setExportSettings(settings);
            handleRenderVideo(settings);
          }}
          slideCount={story.slides.length}
          currentSlideIndex={currentSlideIndex}
        />
      </div>
  );
}
