import Image from "next/image";
import React, { useState } from "react";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiCamera } from "react-icons/fi";

import { User } from "../../gql/graphql";
import axios from "axios";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryUpdateUser } from "../../graphql/user";
import { useForm } from "react-hook-form";

interface IProps {
  data: User;
  open: boolean;
  setOpenProfileModal: (openProfileModal: boolean) => void;
  setUpdateUserData: (updateUserData: boolean) => void;
}

const inputClass =
  "w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all";

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
      const formData = new FormData();
      formData.append("images", profileImg);
      const resImages = await axios.post("/image/avatar", formData);
      if (resImages.data.images) profileLink = resImages.data.images[0];
    }
    if (coverImg) {
      const formData = new FormData();
      formData.append("images", coverImg);
      const resImages = await axios.post("/image/cover", formData);
      if (resImages.data.images) coverLink = resImages.data.images[0];
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
      toast.success("Profile updated!");
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpenProfileModal(false)}
        center
        classNames={{ modal: "customModal !rounded-2xl !p-0 !bg-white dark:!bg-gray-900" }}
      >
        <div className="bg-white dark:bg-gray-900 w-full md:w-[480px] max-h-[85vh] overflow-y-auto">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit profile</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Cover image */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cover photo</p>
              <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 group">
                {(preCoverImg || data.coverImage) && (
                  <Image
                    src={preCoverImg || data.coverImage || "/images/user-avatar.png"}
                    alt="cover"
                    fill
                    className="object-cover"
                  />
                )}
                <label
                  htmlFor="files2"
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-white text-gray-900 text-sm font-semibold">
                    <FiCamera className="w-4 h-4" />
                    Update cover
                  </span>
                </label>
                <input
                  type="file"
                  id="files2"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) handleCoverImg(files[0]);
                  }}
                />
              </div>
            </div>

            {/* Avatar */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Profile picture</p>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-800">
                  <Image
                    src={preProfileImg || data.avatar || "/images/user-avatar.png"}
                    alt="avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <label
                  htmlFor="files1"
                  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer transition-colors"
                >
                  <FiCamera className="w-4 h-4" />
                  Change photo
                </label>
                <input
                  type="file"
                  id="files1"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files) handleProfileImg(files[0]);
                  }}
                />
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
                <input
                  defaultValue={data.firstName}
                  className={inputClass}
                  type="text"
                  {...register("firstName")}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
                <input
                  defaultValue={data.lastName}
                  className={inputClass}
                  type="text"
                  {...register("lastName")}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setOpenProfileModal(false)}
                className="h-9 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default ProfileModal;
