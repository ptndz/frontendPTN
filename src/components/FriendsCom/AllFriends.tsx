import React, { useEffect, useState } from "react";
import SingleFriends from "./SingleFriends";

import { User, IUser } from "../../gql/graphql";
import axios from "axios";
import { graphql } from "../../gql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { useStoreUser } from "../../store/user";
import { Badge } from "@astryxdesign/core/Badge";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { Heading } from "@astryxdesign/core/Heading";
import { HStack } from "@astryxdesign/core/HStack";
import { List } from "@astryxdesign/core/List";
import { Stack } from "@astryxdesign/core/Stack";
import { TextInput } from "@astryxdesign/core/TextInput";
import { useI18n } from "../../i18n/I18nProvider";

/** One incoming friend request: the numeric Friend row id (needed by
 *  PUT /friends/response/:id) + the requester. Source: existing REST
 *  GET /friends/me/received-requests — the GraphQL friendRequest query
 *  only returns user ids, which cannot answer a request. */
interface FriendRequestItem {
  id: number;
  user: IUser;
}

const AllFriends = () => {
  const { t } = useI18n();
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const { user } = useStoreUser();
  const [usersYouMayKnow, setUsersYouMayKnow] = useState<IUser[]>([]);
  const [friendRequest, setFriendRequest] = useState<FriendRequestItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [responding, setResponding] = useState<{
    id: number;
    status: "accepted" | "declined";
  } | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<string[]>([]);

  const queryGetUsersYouMayKnow = graphql(`
    query getUsersYouMayKnow {
      getUsersYouMayKnow {
        code
        success
        message
        users {
          id
          fullName
          avatar
          username
        }
        errors {
          message
          field
        }
      }
    }
  `);
  useEffect(() => {
    const myFriends = async () => {
      try {
        const res = await axios.get("/friends/my");
        if (res.data.success) {
          setUsers(res.data.friends);
        }

        const resReceived = await axios.get("/friends/me/received-requests");
        if (
          resReceived.data?.success &&
          Array.isArray(resReceived.data.requests)
        ) {
          setFriendRequest(
            resReceived.data.requests
              .filter((item: any) => item?.user != null)
              .map((item: any) => ({
                id: item.id,
                user: item.user as IUser,
              }))
          );
        }

        const resUsers = await graphQLClient.request(queryGetUsersYouMayKnow);
        if (graphQLClientErrorCheck(resUsers)) {
          if (resUsers.getUsersYouMayKnow.users) {
            const data = resUsers.getUsersYouMayKnow.users.filter(
              (userData) => {
                // W6: users là Maybe<User>[] — phần tử có thể null.
                return userData != null && userData.id !== user.id;
              }
            );
            setUsersYouMayKnow(data as IUser[]);
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoaded(true);
      }
    };
    myFriends();
  }, [queryGetUsersYouMayKnow, user.id]);

  // Client-side search: filters every section by name or username.
  const query = searchText.trim().toLowerCase();
  const matches = (person: { fullName?: string | null; username?: string | null }) =>
    query === "" ||
    (person.fullName || "").toLowerCase().includes(query) ||
    (person.username || "").toLowerCase().includes(query);
  const visibleFriends = users.filter(matches);
  const visibleRequests = friendRequest.filter((item) => matches(item.user));
  const visibleSuggestions = usersYouMayKnow.filter(matches);

  const handleRespond = async (
    item: FriendRequestItem,
    status: "accepted" | "declined"
  ) => {
    if (responding) return;
    setResponding({ id: item.id, status });
    try {
      const res = await axios.put(`/friends/response/${item.id}`, { status });
      if (res.data?.status) {
        setFriendRequest((prev) => prev.filter((r) => r.id !== item.id));
        if (status === "accepted") {
          setUsers((prev) => [item.user as User, ...prev]);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setResponding(null);
    }
  };

  const handleSend = async (target: IUser) => {
    if (sendingId) return;
    setSendingId(target.id);
    try {
      const res = await axios.post(`/friends/send/${target.id}`);
      if (res.data?.status) {
        setSentIds((prev) => [...prev, target.id]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSendingId(null);
    }
  };

  const noResultsTitle = t("friends.noResults", { q: searchText.trim() });

  return (
    <Stack gap={6} paddingBlockEnd={8}>
      <TextInput
        label={t("friends.searchLabel")}
        isLabelHidden
        type="search"
        startIcon="search"
        hasClear
        value={searchText}
        onChange={(value) => setSearchText(value)}
        placeholder={t("friends.searchPlaceholder")}
      />

      <Stack gap={2}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{t("friends.requests")}</Heading>
          {loaded && (
            <Badge label={String(visibleRequests.length)} variant="neutral" />
          )}
        </HStack>
        {loaded &&
          (visibleRequests.length > 0 ? (
            <List hasDividers>
              {visibleRequests.map((item) => (
                <SingleFriends
                  key={item.id}
                  user={item.user as User}
                  variant="request"
                  busyStatus={
                    responding?.id === item.id ? responding.status : null
                  }
                  onRespond={(status) => handleRespond(item, status)}
                />
              ))}
            </List>
          ) : (
            <EmptyState
              title={query === "" ? t("friends.noRequests") : noResultsTitle}
              description={
                query === ""
                  ? t("friends.noRequestsHint")
                  : t("friends.tryDifferent")
              }
            />
          ))}
      </Stack>

      <Stack gap={2}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{t("friends.friendsHeading")}</Heading>
          {loaded && (
            <Badge label={String(visibleFriends.length)} variant="neutral" />
          )}
        </HStack>
        {loaded &&
          (visibleFriends.length > 0 ? (
            <List hasDividers>
              {visibleFriends.map((friend) => (
                <SingleFriends
                  key={friend.username}
                  user={friend}
                  variant="friend"
                />
              ))}
            </List>
          ) : (
            <EmptyState
              title={query === "" ? t("friends.noFriends") : noResultsTitle}
              description={
                query === ""
                  ? t("friends.noFriendsHint")
                  : t("friends.tryDifferent")
              }
            />
          ))}
      </Stack>

      <Stack gap={2}>
        <HStack gap={2} vAlign="center">
          <Heading level={2}>{t("friends.youMayKnow")}</Heading>
          {loaded && (
            <Badge
              label={String(visibleSuggestions.length)}
              variant="neutral"
            />
          )}
        </HStack>
        {loaded &&
          (visibleSuggestions.length > 0 ? (
            <List hasDividers>
              {visibleSuggestions.map((suggestion) => (
                <SingleFriends
                  key={suggestion.username}
                  user={suggestion as User}
                  variant="suggestion"
                  sending={sendingId === suggestion.id}
                  sent={sentIds.includes(suggestion.id)}
                  onSend={() => handleSend(suggestion)}
                />
              ))}
            </List>
          ) : (
            <EmptyState
              title={query === "" ? t("friends.noSuggestions") : noResultsTitle}
              description={
                query === ""
                  ? t("friends.noSuggestionsHint")
                  : t("friends.tryDifferent")
              }
            />
          ))}
      </Stack>
    </Stack>
  );
};

export default AllFriends;
