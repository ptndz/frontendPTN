import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import UserListSkeleton from "../Loaders/UserListSkeleton";
import { User } from "../../gql/graphql";
import { Drawer } from "@astryxdesign/core/Drawer";
import { DrawerHeader } from "@astryxdesign/core/Drawer";
import { TextInput } from "@astryxdesign/core/TextInput";
import { IconButton } from "@astryxdesign/core/IconButton";
import { List, ListItem } from "@astryxdesign/core/List";
import { Avatar } from "@astryxdesign/core/Avatar";
import { Stack } from "@astryxdesign/core/Stack";
import { useI18n } from "../../i18n/I18nProvider";
import { HStack } from "@astryxdesign/core/HStack";

interface IProps {
  isOffCanvasOpen?: boolean;
  closeOffCanvas: () => void;
  setCurrentChat: (chat: any) => void;
  currentId?: string;
  allUsers: User[];
}
const ChatUserSearchOffCanvas: React.FC<IProps> = ({
  isOffCanvasOpen,
  closeOffCanvas,
  setCurrentChat,
  currentId,
  allUsers,
}) => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState<User[]>();
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    if (search !== "") {
      try {
        const res = await axios.get(`/user/search?keyword=${search}`);
        setSearchResult(res.data.users);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleClick = async (user: User) => {
    const getConversations = async () => {
      try {
        const res = await axios.get(
          `/messenger/conversation?friendId=${user.id}`
        );
        setCurrentChat(res.data.conversation);
        toast(t("messenger.searchUsers.addedToConversation", { name: user.fullName }));
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  };
  return (
    <Drawer
      isOpen={!!isOffCanvasOpen}
      onOpenChange={(open) => {
        if (!open) closeOffCanvas();
      }}
      side="start"
      width={448}
      label={t("messenger.searchUsers.title")}>
      <DrawerHeader
        title={t("messenger.searchUsers.title")}
        onOpenChange={(open) => {
          if (!open) closeOffCanvas();
        }}
      />
      <Stack gap={0} className="h-full">
        <form onSubmit={handleSubmit} className="py-4 border-b border-line px-3">
          <HStack gap={4} vAlign="center">
            <TextInput
              label={t("messenger.searchUsers.search")}
              isLabelHidden
              type="search"
              enterKeyHint="search"
              startIcon="search"
              value={search}
              onChange={(value) => setSearch(value)}
              placeholder={t("messenger.searchUsers.search")}
              containerClassName="flex-1 min-w-0"
            />
            <IconButton
              type="submit"
              variant="secondary"
              label={t("messenger.searchUsers.search")}
              icon={<FiSearch className="h-5 w-5" />}
            />
          </HStack>
        </form>

        {loading ? (
          <UserListSkeleton />
        ) : (
          <List className="flex-1 min-h-0 overflow-y-auto">
            {(searchResult || []).map((user) => (
              <ListItem
                key={user.id}
                label={user.fullName}
                description={user.username}
                startContent={
                  user.avatar ? (
                    <Avatar
                      src={user.avatar}
                      fallbackSrc="/images/user-avatar.png"
                      name={user.fullName}
                      size={40}
                      tooltip={false}
                    />
                  ) : (
                    <Avatar name={user.fullName} size={40} tooltip={false} />
                  )
                }
                onClick={() => {
                  handleClick(user);
                  closeOffCanvas();
                }}
              />
            ))}
          </List>
        )}
      </Stack>
    </Drawer>
  );
};

export default ChatUserSearchOffCanvas;
