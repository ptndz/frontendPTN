import React from "react";
import { useForm } from "react-hook-form";

import { toast } from "react-toastify";
import { ProfileUser } from "../../gql/graphql";
import { graphQLClient, graphQLClientErrorCheck } from "../../plugins/graphql.plugin";
import { queryUpdateProfile } from "../../graphql/user";
import { Button } from "@astryxdesign/core/Button";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { HStack } from "@astryxdesign/core/HStack";
import { Stack } from "@astryxdesign/core/Stack";
import { Text } from "@astryxdesign/core/Text";
import { useI18n } from "../../i18n/I18nProvider";

interface IProps {
  data: ProfileUser;
  openDetailsModal: boolean;
  setOpenDetailsModal: (openDetailsModal: boolean) => void;
  setUpdateUserData: (updateUserData: boolean) => void;
}

const AboutModal: React.FC<IProps> = ({
  data,
  openDetailsModal,
  setOpenDetailsModal,
  setUpdateUserData,
}) => {
  const { register, handleSubmit } = useForm();
  const { t } = useI18n();

  const onSubmit = async (data: any) => {
    const res = await graphQLClient.request(queryUpdateProfile, {
      city: data.city,
      education: data.education,
      from: data.from,
      relationship: data.relationship,
      workplace: data.workplace,
    });
    if (graphQLClientErrorCheck(res)) {
      setUpdateUserData(true);
      toast(t("profile.aboutUpdated"));
      setOpenDetailsModal(false);
    }
  };
  return (
    <Dialog
      isOpen={openDetailsModal}
      onOpenChange={(isOpen) => setOpenDetailsModal(isOpen)}
      purpose="form"
      width={500}>
      <DialogHeader
        title={t("profile.editAbout")}
        onOpenChange={(isOpen) => setOpenDetailsModal(isOpen)}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={3} padding={4}>
          <Stack gap={1}>
            <Text>{t("profile.education")}</Text>
            <input
              className="field"
              type="text"
              {...register("education")}
              defaultValue={data?.education}
              placeholder={data?.education}
            />
          </Stack>
          <Stack gap={1}>
            <Text>{t("profile.livesInLabel")}</Text>
            <input
              className="field"
              type="text"
              {...register("city")}
              defaultValue={data?.city}
              placeholder={data?.city}
            />
          </Stack>
          <Stack gap={1}>
            <Text>{t("profile.fromLabel")}</Text>
            <input
              className="field"
              type="text"
              {...register("from")}
              defaultValue={data?.from}
              placeholder={data?.from}
            />
          </Stack>
          <Stack gap={1}>
            <Text>{t("profile.workplace")}</Text>
            <input
              className="field"
              type="text"
              {...register("workplace")}
              defaultValue={data?.workplace}
              placeholder={data?.workplace}
            />
          </Stack>
          <Stack gap={1}>
            <Text>{t("profile.relationship")}</Text>
            <select
              id=""
              className="field"
              {...register("relationship")}
              defaultValue={data?.relationship}>
              <option value="Single">{t("profile.single")}</option>
              <option value="In a relationship">{t("profile.inRelationship")}</option>
              <option value="Engaged">{t("profile.engaged")}</option>
              <option value="Married">{t("profile.married")}</option>
            </select>
          </Stack>

          <HStack justify="end">
            <Button label={t("profile.update")} type="submit" variant="primary" />
          </HStack>
        </Stack>
      </form>
    </Dialog>
  );
};

export default AboutModal;
