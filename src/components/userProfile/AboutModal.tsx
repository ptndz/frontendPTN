
import React from "react";
import { useForm } from "react-hook-form";

import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { toast } from "react-toastify";
import { ProfileUser } from "../../gql/graphql";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryUpdateProfile } from "../../graphql/user";

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

  const onSubmit = async (data: any) => {
    const res = await graphQLClient.request(queryUpdateProfile, {
      city: data.city,
      education: data.education,
      from: data.from,
      relationship: data.relationship,
      workplace: data.workplace,
    });
    if (res.updateProfile.code === 200) {
      setUpdateUserData(true);
      toast("Profile updated successfully");
      setOpenDetailsModal(false);
    }
  };
  return (
    <Modal
      open={openDetailsModal}
      onClose={() => setOpenDetailsModal(false)}
      center
      classNames={{
        modal: "customModal",
      }}>
      <div className="bg-white dark:bg-zinc-900 p-5 shadow-xl text-gray-800 md:w-[500px]">
        <div className="flex justify-between items-center border-b-2 py-3 mb-5 border-gray-500">
          <h4 className="text-lg font-bold dark:text-white">Edit about</h4>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label className="dark:text-white">Educations</label>
          <input
            className="w-full h-12 mb-3 bg-transparent rounded-lg px-2 dark:text-white"
            type="text"
            {...register("education")}
            defaultValue={data?.education}
            placeholder={data?.education}
          />
          <label className="dark:text-white">Lives in </label>
          <input
            className="w-full h-12 mb-3 bg-transparent rounded-lg px-2 dark:text-white"
            type="text"
            {...register("city")}
            defaultValue={data?.city}
            placeholder={data?.city}
          />
          <label className="dark:text-white">From</label>
          <input
            className="w-full h-12 mb-3 bg-transparent rounded-lg px-2 dark:text-white"
            type="text"
            {...register("from")}
            defaultValue={data?.from}
            placeholder={data?.from}
          />
          <label className="dark:text-white">Workplace</label>
          <input
            className="w-full h-12 mb-3 bg-transparent rounded-lg px-2 dark:text-white"
            type="text"
            {...register("workplace")}
            defaultValue={data?.workplace}
            placeholder={data?.workplace}
          />
          <label className="dark:text-white">Relationship</label>
          <select
            id=""
            className="w-full h-12 mb-3 dark:bg-zinc-900 rounded-lg dark:text-white px-3"
            {...register("relationship")}
            placeholder={data?.relationship}
            defaultValue={data?.relationship}>
            <option value="Single">Single</option>
            <option value="In a relationship">In a relationship </option>
            <option value="Engaged">Engaged </option>
            <option value="Married">Married </option>
          </select>

          <div className="my-3 flex justify-end space-x-3 ">
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-green-500 text-gray-200 hover:bg-green-700 rounded-md">
              Update
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AboutModal;
