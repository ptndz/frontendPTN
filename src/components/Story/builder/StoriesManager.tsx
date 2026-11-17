import React, { useState, useMemo } from 'react'
import {
  Sparkles, Plus, Search, Trash2, Edit3, Copy,
  CheckCircle2, Clock, RefreshCw
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Story } from './types'
import { getAdminStories, createStory, deleteStory, publishBuilderStory, archiveBuilderStory } from './services/api'

interface StoriesManagerProps {
  onCreateNew: () => void;
  onEdit: (story: Story) => void;
  onPreview?: (story: Story) => void;
}

export const StoriesManager: React.FC<StoriesManagerProps> = ({
  onCreateNew,
  onEdit,
}) => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'draft'>('all')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['admin_stories'],
    queryFn: () => getAdminStories(),
  })

  const stories = data?.items || []

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_stories'] })
    },
  })

  // MXH: đổi status chỉ qua POST /:id/publish và /:id/archive — PUT body
  // không đổi được status (backend bỏ qua field status).
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'draft' }) =>
      status === 'active' ? publishBuilderStory(id) : archiveBuilderStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_stories'] })
    },
  })

  const duplicateMutation = useMutation({
    mutationFn: (story: Story) => {
      return createStory({
        title: `${story.title} (Bản sao)`,
        thumbnail_url: story.thumbnail_url,
        product_id: story.product_id,
        status: 'draft',
        priority: story.priority,
        slides: story.slides,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_stories'] })
    },
  })

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || s.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [stories, search, filterStatus])

  const stats = useMemo(() => {
    const total = stories.length
    const active = stories.filter((s) => s.status === 'active').length
    const draft = stories.filter((s) => s.status === 'draft').length
    return { total, active, draft }
  }, [stories])

  const getSlidePreviewStyle = (story: Story): React.CSSProperties => {
    const firstSlide = story.slides?.[0]
    if (!firstSlide) return { background: 'linear-gradient(135deg, #1e293b, #0f172a)' }
    const bg = firstSlide.background
    if (bg.type === 'color') return { backgroundColor: bg.value }
    if (bg.type === 'gradient') return { background: bg.value }
    if (bg.type === 'image') {
      return {
        backgroundImage: `url(${bg.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return { background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }
  }

  return (
    <div className="space-y-6">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            Quản lý Story & Tin Nổi Bật
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tạo các câu chuyện đa phương tiện toàn màn hình gắn nút mua hàng trên Telegram Miniapp.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2.5 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo Story mới
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Tổng Story</p>
            <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Đang phát sóng</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">{stats.active}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Bản nháp</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{stats.draft}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm Story theo tiêu đề..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-muted-foreground/60"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl p-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'active'
                ? 'bg-emerald-500 text-ink shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đang chạy
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filterStatus === 'draft'
                ? 'bg-amber-500 text-ink shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Bản nháp
          </button>
        </div>
      </div>

      {/* Stories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : filteredStories.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-1">Chưa có Story nào</h3>
          <p className="text-xs text-muted-foreground max-w-sm mb-6">
            Tạo Story đầu tiên với ảnh, video, hiệu ứng động và liên kết sản phẩm để thu hút khách mua sắm.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Tạo Story ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStories.map((story) => {
            const slideCount = story.slides?.length || 0
            const isActive = story.status === 'active'

            return (
              <div
                key={story.id}
                className="group relative bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all flex flex-col"
              >
                {/* 9:16 Mini Preview Banner */}
                <div
                  className="relative h-48 w-full overflow-hidden cursor-pointer flex items-end p-3"
                  style={getSlidePreviewStyle(story)}
                  onClick={() => onEdit(story)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                  {/* Badges on top */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-warning border-amber-500/30'
                      }`}
                    >
                      {isActive ? 'Đang chạy' : 'Bản nháp'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-medium text-ink/90 bg-ink/80 backdrop-blur-md rounded-md border border-white/10">
                      {slideCount} slide{slideCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="relative z-10 w-full">
                    <h4 className="text-ink text-sm font-bold line-clamp-2 drop-shadow-md">
                      {story.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Ưu tiên: #{story.priority}</span>
                    <span>
                      {story.created_at
                        ? new Date(story.created_at).toLocaleDateString('vi-VN')
                        : 'Mới'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/60 gap-1.5">
                    <button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: story.id,
                          status: isActive ? 'draft' : 'active',
                        })
                      }
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-secondary/40 text-muted-foreground border-border hover:bg-secondary'
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => duplicateMutation.mutate(story)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                        title="Nhân bản Story"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(story)}
                        className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        title="Chỉnh sửa Canvas"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Bạn có chắc muốn xóa story "${story.title}"?`)) {
                            deleteMutation.mutate(story.id)
                          }
                        }}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        title="Xóa Story"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
