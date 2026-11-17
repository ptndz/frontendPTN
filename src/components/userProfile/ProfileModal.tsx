import Image from "next/image";
import React, { useEffect, useState } from "react";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { User } from "../../gql/graphql";
import axios from "axios";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryUpdateUser } from "../../graphql/user";
import { useForm } from "react-hook-form";
import { Button } from "@astryxdesign/core/Button";
import { Center } from "@astryxdesign/core/Center";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/HStack";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useI18n } from "../../i18n/I18nProvider";

interface IProps {
  data: User;
  open: boolean;
  setOpenProfileModal: (openProfileModal: boolean) => void;
  setUpdateUserData: (updateUserData: boolean) => void;
}

const ProfileModal: React.FC<IProps> = ({
  data,
  open,
  setOpenProfileModal,
  setUpdateUserData,
}) => {
  const [preProfileImg, setPreProfileImg] = useState<any>();
  const [preCoverImg, setPreCoverImg] = useState<any>();

  const [profileImg, setProfileImg] = useState<File>();
  const [coverImg, setCoverImg] = useState<File>();

  const { register, handleSubmit } = useForm();
  const { t } = useI18n();

  const handleProfileImg = (file: File) => {
    setProfileImg(file);
    setPreProfileImg(URL.createObjectURL(file));
  };
  const handleCoverImg = (file: File) => {
    setCoverImg(file);
    setPreCoverImg(URL.createObjectURL(file));
  };

  const onSubmit = async (e: any) => {
    setOpenProfileModal(false);
    let profileLink = "";
    let coverLink = "";
    if (profileImg) {
      let formData = new FormData();
      formData.append("images", profileImg);
      let resImages = await axios.post("/image/avatar", formData);
      if (resImages.data.images) {
        profileLink = resImages.data.images[0];
      }
    }
    if (coverImg) {
      let formData = new FormData();
      formData.append("images", coverImg);
      let resImages = await axios.post("/image/cover", formData);
      if (resImages.data.images) {
        coverLink = resImages.data.images[0];
      }
    }
    const newFirstName = e.firstName || data.firstName;
    const newLastName = e.lastName || data.lastName;
    const res = await graphQLClient.request(queryUpdateUser, {
      firstName: newFirstName,
      lastName: newLastName,
      avatar: profileLink || data.avatar,
      coverImage: coverLink || data.coverImage,
      fullName: `${newFirstName} ${newLastName}`,
    });
    if (graphQLClientErrorCheck(res)) {
      setUpdateUserData(true);
      toast(t("profile.updated"));
    }
  };
  return (
    <>
      <Dialog
        isOpen={open}
        onOpenChange={(isOpen) => setOpenProfileModal(isOpen)}
        purpose="form"
        width={560}>
        <DialogHeader
          title={t("profile.editProfile")}
          onOpenChange={(isOpen) => setOpenProfileModal(isOpen)}
        />
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap={4} padding={4}>
            <HStack justify="between" vAlign="center">
              <Text type="large" weight="bold">
                {t("profile.profilePicture")}
              </Text>
              <label htmlFor="files1">
                <Text type="large" weight="bold" color="accent">
                  {t("profile.update")}
                </Text>
              </label>
              <input
                type="file"
                name="file"
                id="files1"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) handleProfileImg(files[0]);
                }}
              />
            </HStack>
            <Center axis="horizontal">
              <Image
                className="object-cover rounded-full border-2 border-line bg-no-repeat"
                src={preProfileImg || data.avatar || "/images/user-avatar.png"}
                alt={t("profile.imageAlt")}
                width="120"
                height="120"
              />
            </Center>
            <HStack justify="between" vAlign="center">
              <Text type="large" weight="bold">
                {t("profile.coverPhoto")}
              </Text>
              <label htmlFor="files2">
                <Text type="large" weight="bold" color="accent">
                  {t("profile.update")}
                </Text>
              </label>
              <input
                type="file"
                name="file"
                id="files2"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files) handleCoverImg(files[0]);
                }}
              />
            </HStack>

            <Center axis="horizontal">
              <Image
                className="object-cover"
                src={
                  preCoverImg || data.coverImage || "/images/user-avatar.png"
                }
                alt={t("profile.imageAlt")}
                width="500"
                height="200"
              />
            </Center>
            <Stack gap={1}>
              <Text type="large" weight="medium">
                {t("profile.changeFirstName")}
              </Text>
              <input
                placeholder={data.firstName}
                defaultValue={data.firstName}
                className="field"
                type="text"
                {...register("firstName")}
              />
            </Stack>
            <Stack gap={1}>
              <Text type="large" weight="medium">
                {t("profile.changeLastName")}
              </Text>
              <input
                placeholder={data.lastName}
                defaultValue={data.lastName}
                className="field"
                type="text"
                {...register("lastName")}
              />
            </Stack>
            <HStack justify="end">
              <Button label={t("profile.update")} type="submit" variant="primary" />
            </HStack>
          </Stack>
        </form>
      </Dialog>
      <ToastContainer />
    </>
  );
};

export default ProfileModal;
