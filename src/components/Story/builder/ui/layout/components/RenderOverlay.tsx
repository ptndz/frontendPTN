import React from 'react';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { CanvasElement } from '../../canvas';
import { RESOLUTION_MAP, type ExportSettings } from '../../modals';
import type { StorySlide } from '../../../types';

interface RenderOverlayProps {
  isRendering: boolean;
  renderProgress: number;
  loadingStatus: string;
  currentSlide: StorySlide | null;
  exportSettings: ExportSettings;
  renderTime: number;
}

export function RenderOverlay({
  isRendering,
  renderProgress,
  loadingStatus,
  currentSlide,
  exportSettings,
  renderTime,
}: RenderOverlayProps) {
  if (!isRendering) return null;

  return (
    <>
      {/* Loading Overlay — Mono: nền trắng, chữ đen */}
      <div className="fixed inset-0 bg-paper z-[100] flex flex-col items-center justify-center text-ink overflow-hidden">
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          @keyframes spinnerPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.15); }
            50% { box-shadow: 0 0 24px 8px rgba(0, 0, 0, 0.08); }
          }
        `}</style>

        {/* Spinner with pulsing glow */}
        <div className="relative mb-6" style={{ animation: 'spinnerPulse 2s ease-in-out infinite' }}>
          <svg width={64} height={64} viewBox="0 0 24 24" fill="none" className="animate-spin text-accent">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-line" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </div>

        <h2 className="text-xl font-bold mb-2 relative z-10">{loadingStatus || 'Đang xuất video'}</h2>
        <p className="text-muted text-sm max-w-md text-center relative z-10 mb-1">
          Vui lòng không chuyển tab hay thu nhỏ cửa sổ.
        </p>
        <p className="text-2xl font-mono font-bold text-accent mb-4 relative z-10 tabular-nums">
          {renderProgress}%
        </p>

        {/* Progress bar with shimmer */}
        <div className="w-72 h-2.5 bg-line rounded-full overflow-hidden relative z-10 border border-line">
          <div
            className="h-full bg-accent transition-all duration-300 relative rounded-full"
            style={{ width: `${renderProgress}%` }}
          >
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{ animation: 'shimmer 2s ease-in-out infinite' }}
            />
          </div>
        </div>
      </div>

      {/* Hidden Render Container */}
      {currentSlide && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            width: `${RESOLUTION_MAP[exportSettings.resolution].width}px`,
            height: `${RESOLUTION_MAP[exportSettings.resolution].height}px`,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            id="render-container"
            className="relative bg-white"
            style={{
              width: '360px',
              height: '640px',
              transform: `scale(${RESOLUTION_MAP[exportSettings.resolution].width / 360})`,
              transformOrigin: 'top left',
            }}
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
                      ? `radial-gradient(circle, ${currentSlide.background.gradient.colors.map((c) => `${c.color} ${c.position}%`).join(', ')})`
                      : `linear-gradient(${currentSlide.background.gradient.angle || 0}deg, ${currentSlide.background.gradient.colors.map((c) => `${c.color} ${c.position}%`).join(', ')})`,
                }}
              />
            )}
            {currentSlide.background.type === 'image' && (
              <img
                src={resolveMediaUrl(currentSlide.background.value)}
                className="absolute inset-0 w-full h-full object-cover"
                alt="bg"
              />
            )}

            {/* Elements */}
            {currentSlide.elements.map((el) => (
              <CanvasElement
                key={`${el.id}-${renderTime}`}
                element={el}
                isSelected={false}
                onSelect={() => {}}
                onUpdate={() => {}}
                currentTime={renderTime}
                playAnimation={false}
                snapToGrid={false}
                gridSize={0}
                renderMode={true}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
