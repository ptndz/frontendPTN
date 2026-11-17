import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { useI18n } from "../../i18n/I18nProvider";
import { Stack } from "@astryxdesign/core/Stack";
import { HStack } from "@astryxdesign/core/HStack";
import { Text } from "@astryxdesign/core/Text";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Icon } from "@astryxdesign/core/Icon";
import { Grid } from "@astryxdesign/core/Grid";

interface IProps {
  conversationId: number;
  onClose: () => void;
}

/**
 * Gallery media của đoạn chat (P2.3): lưới ảnh/video đã gửi trong đoạn
 * đó, mới nhất trước. Bấm vào mở media gốc ở tab mới.
 */
const MediaGallery: React.FC<IProps> = ({ conversationId, onClose }) => {
  const { t } = useI18n();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`/messenger/conversations/${conversationId}/media?limit=60`);
        if (!cancelled) setMedia(res.data.media || []);
      } catch {
        if (!cancelled) setError(t("messenger.gallery.loadFailed"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [conversationId]);

  return (
    <Stack gap={3} className="w-full max-sm:absolute max-sm:inset-0 max-sm:z-10 max-sm:border-l-0 lg:w-72 shrink-0 border-l border-line bg-surface overflow-y-auto p-4">
      <HStack gap={2} vAlign="center" hAlign="between">
        <Text weight="semibold">
          {t("messenger.gallery.title", { count: media.length })}
        </Text>
        <IconButton
          size="sm"
          variant="ghost"
          label={t("common.close")}
          icon={<Icon icon="close" />}
          onClick={onClose}
        />
      </HStack>
      {loading ? (
        <Text size="sm" color="secondary">
          {t("messenger.gallery.loading")}
        </Text>
      ) : error ? (
        <Text size="sm" className="text-danger">
          {error}
        </Text>
      ) : media.length === 0 ? (
        <Text size="sm" color="secondary">
          {t("messenger.gallery.empty")}
        </Text>
      ) : (
        <Grid columns={3} gap={2}>
          {media.map((m: any) =>
            m.type === "VIDEO" ? (
              <a key={m.id} href={m.message} target="_blank" rel="noreferrer" title={t("messenger.gallery.videoBy", { name: m.user?.fullName || "" })}>
                <video src={m.message} preload="metadata" className="w-full aspect-square object-cover rounded-lg bg-line" />
              </a>
            ) : (
              <a key={m.id} href={m.message} target="_blank" rel="noreferrer" title={t("messenger.gallery.photoBy", { name: m.user?.fullName || "" })}>
                <Image width={200} height={200} src={m.message} alt={m.user?.fullName || t("messenger.imageAlt")} className="w-full aspect-square object-cover rounded-lg" />
              </a>
            )
          )}
        </Grid>
      )}
    </Stack>
  );
};

export default MediaGallery;
