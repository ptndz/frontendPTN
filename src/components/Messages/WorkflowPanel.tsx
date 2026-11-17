import React from "react";
import { useI18n } from "../../i18n/I18nProvider";
import { Dialog } from "@astryxdesign/core/Dialog";
import { DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

interface IProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Tài liệu "Quy trình làm việc" (lệnh Nam 2026-11-15): mở từ trang
 * Messages, ai đọc cũng biết cách làm theo — giao việc, lệnh nhanh,
 * vai trò, kênh dùng khi nào, quy tắc đồng bộ. Nội dung lấy từ i18n
 * `workflow` (vi/en); bản markdown tương ứng ở docs/workflow.md.
 * Khớp thiết kế kênh trao đổi mục 7 trong
 * ~/workspace/mxh-codeweb-protocol-integration.md (MXH project_tasks
 * là nguồn sự thật cho trạng thái task; INDEX.md là mirror đọc-nhanh).
 */
const SECTIONS = ["flow", "commands", "roles", "channels", "sync"] as const;

const WorkflowPanel: React.FC<IProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  if (!isOpen) return null;
  return (
    <Dialog
      isOpen
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      purpose="info"
      width={640}>
      <DialogHeader
        title={t("workflow.title")}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      />
      <VStack gap={3} className="flex-1 overflow-y-auto min-h-0">
        <Text size="sm" color="secondary">
          {t("workflow.subtitle")}
        </Text>
        {SECTIONS.map((key) => (
          <VStack key={key} gap={1}>
            <Text weight="semibold">{t(`workflow.${key}Title`)}</Text>
            <Text size="sm" className="whitespace-pre-line">
              {t(`workflow.${key}Body`)}
            </Text>
          </VStack>
        ))}
        <Button
          size="sm"
          variant="primary"
          label={t("common.close")}
          onClick={onClose}
        />
      </VStack>
    </Dialog>
  );
};

export default WorkflowPanel;
