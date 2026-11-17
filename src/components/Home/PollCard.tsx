import React, { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { toast } from "react-toastify";
import { fetchPoll, votePoll } from "../../lib/social";
import type { PollData } from "../../types/social";
import { useI18n } from "../../i18n/I18nProvider";
import { Card } from "@astryxdesign/core/Card";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { VStack } from "@astryxdesign/core/VStack";
import { Text } from "@astryxdesign/core/Text";
import { ProgressBar } from "@astryxdesign/core/ProgressBar";
import { RadioList } from "@astryxdesign/core/RadioList";
import { RadioListItem } from "@astryxdesign/core/RadioList";
import { CheckboxList } from "@astryxdesign/core/CheckboxList";
import { CheckboxListItem } from "@astryxdesign/core/CheckboxList";

interface IProps {
  poll: PollData;
  postUuid: string;
}

/**
 * P1.3 — Thẻ poll dưới bài viết: bấm chọn đáp án rồi Bình chọn,
 * hiện tỉ lệ % + tổng lượt vote, highlight đáp án mình đã chọn,
 * "Đổi lựa chọn" để vote lại. Vote qua POST /polls/:id/vote.
 */
const PollCard: React.FC<IProps> = ({ poll: initialPoll }) => {
  const { t } = useI18n();
  const [poll, setPoll] = useState<PollData>(initialPoll);
  const [selected, setSelected] = useState<string[]>(() => [
    ...initialPoll.userVotedOptionIds,
  ]);
  const [voting, setVoting] = useState(false);
  const [editing, setEditing] = useState(false);

  const hasVoted = poll.userVotedOptionIds.length > 0;
  const showResults = hasVoted && !editing;

  const toggleOption = (optionId: string) => {
    setSelected((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId);
      }
      // Poll 1 đáp án (mặc định): chọn đáp án khác thì thay thế.
      // Poll nhiều đáp án: vẫn cho tick nhiều; backend nhận mảng optionIds.
      return poll.multiple ? [...prev, optionId] : [optionId];
    });
  };

  const handleVote = async () => {
    if (selected.length === 0) {
      toast.error(t("feed.poll.selectOne"));
      return;
    }
    setVoting(true);
    try {
      const updated = await votePoll(poll.id, selected);
      if (updated) {
        setPoll(updated);
        setSelected([...updated.userVotedOptionIds]);
      } else {
        const fresh = await fetchPoll(poll.id);
        if (fresh) {
          setPoll(fresh);
          setSelected([...fresh.userVotedOptionIds]);
        }
      }
      setEditing(false);
      toast.success(t("feed.poll.voteRecorded"));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        t("feed.poll.voteFailed");
      toast.error(String(message));
    } finally {
      setVoting(false);
    }
  };

  const percent = (voteCount: number) =>
    poll.totalVotes > 0
      ? Math.round((voteCount / poll.totalVotes) * 100)
      : 0;

  return (
    <Card variant="muted">
      <VStack gap={3}>
        <Text weight="semibold" size="lg">{poll.question}</Text>
        {showResults ? (
          <VStack gap={2}>
            {poll.options.map((option) => {
              const isVoted = poll.userVotedOptionIds.includes(option.id);
              const pct = percent(option.voteCount);
              return (
                <VStack key={option.id} gap={1}>
                  <HStack gap={2} vAlign="center">
                    {isVoted && (
                      <BsCheckCircleFill className="shrink-0 text-accent-bright" />
                    )}
                    <Text weight="medium" size="sm">
                      {option.text}
                    </Text>
                    <Text type="supporting" size="sm" as="span">
                      {pct}% · {t("feed.poll.votes", { count: option.voteCount })}
                    </Text>
                  </HStack>
                  <ProgressBar
                    label={option.text}
                    isLabelHidden
                    value={pct}
                    hasValueLabel
                  />
                </VStack>
              );
            })}
          </VStack>
        ) : poll.multiple ? (
          <CheckboxList
            label={poll.question}
            isLabelHidden
            value={selected}
            onChange={setSelected}>
            {poll.options.map((option) => (
              <CheckboxListItem
                key={option.id}
                value={option.id}
                label={option.text}
              />
            ))}
          </CheckboxList>
        ) : (
          <RadioList
            label={poll.question}
            isLabelHidden
            value={selected[0] ?? ""}
            onChange={(value) => toggleOption(value)}>
            {poll.options.map((option) => (
              <RadioListItem
                key={option.id}
                value={option.id}
                label={option.text}
              />
            ))}
          </RadioList>
        )}
        <HStack gap={2} vAlign="center" hAlign="between">
          <Text type="supporting" size="sm">
            {t("feed.poll.totalVotes", { count: poll.totalVotes })}
            {hasVoted && !editing ? t("feed.poll.youVoted") : ""}
          </Text>
          {showResults ? (
            <Button
              label={t("feed.poll.changeChoice")}
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                setSelected([...poll.userVotedOptionIds]);
                setEditing(true);
              }}
            />
          ) : (
            <Button
              label={
                voting
                  ? t("feed.poll.sendingVote")
                  : hasVoted
                  ? t("feed.poll.updateVote")
                  : t("feed.poll.vote")
              }
              variant="primary"
              size="sm"
              type="button"
              isLoading={voting}
              isDisabled={voting || selected.length === 0}
              onClick={handleVote}
            />
          )}
        </HStack>
      </VStack>
    </Card>
  );
};

export default PollCard;
