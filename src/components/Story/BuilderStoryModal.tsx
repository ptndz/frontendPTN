import React, { useState } from "react";
import { toast } from "react-toastify";
import { useI18n } from "../../i18n/I18nProvider";
import { StoriesApp } from "./builder/ui/layout/StoriesApp";
import { publishBuilderStory } from "./builder/services/api";

interface BuilderStoryModalProps {
  onClose: () => void;
  /** Gọi sau khi publish thành công để feed ngoài kia load lại. */
  onPublished?: () => void;
}

/**
 * Modal full-screen mở Story Studio (builder copy từ botbanhang).
 *
 * - Danh sách "Tin thiết kế của tôi" + builder đầy đủ (canvas, timeline,
 *   layers, templates, preview) qua <StoriesApp>.
 * - Lưu thành công -> hỏi đăng ngay (publish, hết hạn sau 24h) hoặc để
 *   nháp. Đăng xong thì đóng modal + báo cho feed load lại.
 * - Đóng modal: nút X trên nav danh sách (khi đang ở builder thì bấm
 *   "Thoát" để về danh sách rồi đóng).
 */
const BuilderStoryModal: React.FC<BuilderStoryModalProps> = ({
  onClose,
  onPublished,
}) => {
  const { t } = useI18n();
  const [savedId, setSavedId] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!savedId) return;
    setPublishing(true);
    try {
      await publishBuilderStory(savedId);
      toast.success(t("feed.story.published"));
      setSavedId(null);
      onPublished?.();
      onClose();
    } catch {
      toast.error(t("feed.story.publishFailed"));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-auto bg-paper">
      <StoriesApp onSaved={(id) => setSavedId(id)} onClose={onClose} />

      {/* Hỏi đăng ngay sau khi lưu nháp */}
      {savedId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface p-5 text-ink shadow-xl">
            <h3 className="text-base font-semibold">
              {t("feed.story.builderSavedTitle")}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {t("feed.story.builderPublishPrompt")}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="flex-1 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
              >
                {publishing
                  ? t("feed.story.publishing")
                  : t("feed.story.publishNow")}
              </button>
              <button
                type="button"
                onClick={() => setSavedId(null)}
                disabled={publishing}
                className="flex-1 rounded-full border border-line px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {t("feed.story.publishLater")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuilderStoryModal;
