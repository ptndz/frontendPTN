import axios from "axios";
import React, { useEffect, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import UserListSkeleton from "../Loaders/UserListSkeleton";

import { graphql } from "../../gql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { toast } from "react-toastify";
import { useStoreUser } from "../../store/user";
import { useI18n } from "../../i18n/I18nProvider";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { List } from "@astryxdesign/core/List";
import { ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";

interface IUser {
  fullName: string;
  avatar: string;
  username: string;
}
const RightSideBar = () => {
  const { t } = useI18n();
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useStoreUser();

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
    setLoading(true);
    const fetchData = async () => {
      try {
        const res = await graphQLClient.request(queryGetUsersYouMayKnow);
        if (res.getUsersYouMayKnow.code === 400) {
          toast.error(res.getUsersYouMayKnow.message);
        }
        if (graphQLClientErrorCheck(res)) {
          if (res.getUsersYouMayKnow.users) {
            // W6: users là Maybe<...>[] — lọc phần tử null. Dùng
            // NonNullable thay vì `is IUser`: IUser cục bộ của file này
            // không có field `id` nên không dùng làm type predicate được.
            const data = res.getUsersYouMayKnow.users.filter(
              (userData): userData is NonNullable<typeof userData> =>
                userData != null && userData.id !== user.id
            );
            setUsers(data);
          }
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.warn(error);
      }
    };
    fetchData();
  }, [queryGetUsersYouMayKnow, user]);
  return (
    <Card>
      <VStack gap={3}>
        <Text weight="semibold">{t("sidebar.youMayKnow")}</Text>
        <Divider />
        {loading && <UserListSkeleton />}
        <List>
          {users.map((suggestedUser) => (
            <ListItem
              key={suggestedUser.username}
              href={`/${suggestedUser.username}`}
              label={suggestedUser.fullName}
              startContent={
                <Avatar
                  src={suggestedUser.avatar || "/images/user-avatar.png"}
                  name={suggestedUser.fullName}
                  size={40}
                  tooltip={false}
                />
              }
              endContent={<FiChevronRight />}
            />
          ))}
        </List>
      </VStack>
    </Card>
  );
};

export default RightSideBar;
