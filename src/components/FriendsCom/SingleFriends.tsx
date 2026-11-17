import Link from "next/link";
import React from "react";
import { User } from "../../gql/graphql";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/HStack";
import { ListItem } from "@astryxdesign/core/List";
import { Text } from "@astryxdesign/core/Text";
import { useI18n } from "../../i18n/I18nProvider";

export type SingleFriendVariant = "friend" | "request" | "suggestion";

interface IProps {
  user: User;
  variant: SingleFriendVariant;
  /** Which response is in flight for this request row, if any. */
  busyStatus?: "accepted" | "declined" | null;
  onRespond?: (status: "accepted" | "declined") => void;
  sending?: boolean;
  sent?: boolean;
  onSend?: () => void;
}

/**
 * One person row on the Friends page: 48px avatar + name (links to the
 * profile) + @username subtitle + one obvious action per context —
 * Message for a friend, Accept / Decline for a request, Add friend
 * for a suggestion. No mutual-friends count: no existing endpoint
 * returns one, so the subtitle stays @username rather than inventing data.
 */
const SingleFriends: React.FC<IProps> = ({
  user,
  variant,
  busyStatus,
  onRespond,
  sending,
  sent,
  onSend,
}) => {
  const { avatar, fullName, username } = user;
  const { t } = useI18n();
  const busy = busyStatus != null;

  const actions =
    variant === "request" ? (
      <HStack gap={2}>
        <Button
          label={t("friends.accept")}
          variant="primary"
          size="sm"
          isLoading={busyStatus === "accepted"}
          isDisabled={busy}
          onClick={() => onRespond?.("accepted")}
        />
        <Button
          label={t("friends.decline")}
          variant="ghost"
          size="sm"
          isLoading={busyStatus === "declined"}
          isDisabled={busy}
          onClick={() => onRespond?.("declined")}
        />
      </HStack>
    ) : variant === "suggestion" ? (
      sent ? (
        <Button label={t("friends.pending")} variant="ghost" size="sm" isDisabled />
      ) : (
        <Button
          label={t("friends.addFriend")}
          variant="primary"
          size="sm"
          isLoading={sending}
          isDisabled={sending}
          onClick={() => onSend?.()}
        />
      )
    ) : (
      <Button label={t("friends.message")} variant="primary" size="sm" href="/messenger" />
    );

  return (
    <ListItem
      label={
        <Link href={`/${username}`}>
          <Text weight="semibold" className="cursor-pointer hover:underline">
            {fullName}
          </Text>
        </Link>
      }
      description={`@${username}`}
      startContent={
        <Avatar
          src={avatar || "/images/user-avatar.png"}
          name={fullName || username}
          size={48}
          tooltip={false}
        />
      }
      endContent={actions}
    />
  );
};

export default SingleFriends;
