import React from "react";
import { BsX } from "react-icons/bs";
import { useI18n } from "../../i18n/I18nProvider";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { CheckboxInput } from "@astryxdesign/core/CheckboxInput";
import { TextInput } from "@astryxdesign/core/TextInput";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { StackItem } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";

export interface PollDraft {
  question: string;
  options: string[];
  multiple: boolean;
}

interface IProps {
  value: PollDraft;
  onChange: (value: PollDraft) => void;
}

const MAX_OPTIONS = 6;

/** P1.3 — Form tạo poll trong composer: câu hỏi + 2–6 lựa chọn + cho phép chọn nhiều. */
const PollCreator: React.FC<IProps> = ({ value, onChange }) => {
  const { t } = useI18n();
  const setOption = (index: number, text: string) => {
    const options = [...value.options];
    options[index] = text;
    onChange({ ...value, options });
  };

  const addOption = () => {
    if (value.options.length >= MAX_OPTIONS) return;
    onChange({ ...value, options: [...value.options, ""] });
  };

  const removeOption = (index: number) => {
    if (value.options.length <= 2) return;
    onChange({
      ...value,
      options: value.options.filter((_, i) => i !== index),
    });
  };

  return (
    <VStack gap={2} className="rounded-lg border border-line bg-paper p-3">
      <Text weight="semibold" size="sm">{t("feed.pollCreate.title")}</Text>
      <TextInput
        label={t("feed.pollCreate.questionPlaceholder")}
        isLabelHidden
        value={value.question}
        onChange={(text) => onChange({ ...value, question: text })}
        placeholder={t("feed.pollCreate.questionPlaceholder")}
      />
      <VStack gap={2}>
        {value.options.map((option, index) => (
          <HStack key={index} gap={2} vAlign="center">
            <StackItem size="fill">
              <TextInput
                label={t("feed.pollCreate.optionPlaceholder", { n: index + 1 })}
                isLabelHidden
                value={option}
                onChange={(text) => setOption(index, text)}
                placeholder={t("feed.pollCreate.optionPlaceholder", { n: index + 1 })}
              />
            </StackItem>
            {value.options.length > 2 && (
              <IconButton
                label={t("feed.pollCreate.removeOption")}
                icon={<BsX />}
                variant="ghost"
                size="sm"
                type="button"
                onClick={() => removeOption(index)}
              />
            )}
          </HStack>
        ))}
      </VStack>
      <HStack gap={2} vAlign="center" hAlign="between">
        <CheckboxInput
          label={t("feed.pollCreate.allowMultiple")}
          value={value.multiple}
          onChange={(checked) =>
            onChange({ ...value, multiple: checked })
          }
        />
        {value.options.length < MAX_OPTIONS && (
          <Button
            label={t("feed.pollCreate.addOption")}
            variant="ghost"
            size="sm"
            type="button"
            onClick={addOption}
          />
        )}
      </HStack>
    </VStack>
  );
};

export default PollCreator;
