import Image from "next/image";
import React, { useEffect, useState } from "react";

import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { User } from "../../gql/graphql";
import axios from "axios";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { queryUpdateUser } from "../../graphql/user";
import { useForm } from "react-hook-form";
import { log } from "util";

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

  const [profileLink, setProfileLink] = useState<string>();
  const [coverLink, setCoverLink] = useState<string>();

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

    if (profileImg) {
      let formData = new FormData();
      formData.append("images", profileImg);
      const resImages = await axios.post("/image/avatar", formData);
      if (resImages.data.images) {
        setProfileLink(resImages.data.images[0]);
      }
    }

    if (coverImg) {
      let formData = new FormData();
      formData.append("images", coverImg);
      const resImages = await axios.post("/image/cover", formData);
      if (resImages.data.images) {
        setCoverLink(resImages.data.images[0]);
      }
    }

    const res = await graphQLClient.request(queryUpdateUser, {
      firstName: e.firstName,
      lastName: e.lastName,
      avatar: profileLink || data.avatar,
      coverImage: coverLink || data.coverImage,
      fullName: `${e.firstName} ${e.lastName}`,
    });
    if (res.updateUser.code === 200) {
      setUpdateUserData(true);
      toast("🦄 Profile updated!");
    }
  };
  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpenProfileModal(false)}
        center
        classNames={{
          modal: "customModal",
        }}>
        <div className="bg-white dark:bg-zinc-900 px-7 py-3 shadow-xl text-gray-800">
          <div className="flex justify-between items-center border-b-2 py-3 border-gray-500">
            <h4 className="text-lg font-bold dark:text-white">Edit profile</h4>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex justify-between items-center pt-5">
              <h4 className="text-lg font-bold dark:text-white">
                Profile Picture
              </h4>
              <div>
                <label htmlFor="files1">
                  <span className="text-lg text-blue-600 font-bold hover:bg-gray-300 px-3 py-1 rounded-md cursor-pointer">
                    Update
                  </span>
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
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                className="object-cover rounded-full border-2 bg-no-repeat"
                src={
                  preProfileImg ||
                  data.avatar ||
                  "https://i.ibb.co/5kdWHNN/user-12.png"
                }
                alt="profile image"
                width="120"
                height="120"
              />
            </div>
            <div className="flex justify-between items-center py-5">
              <h4 className="text-lg font-bold dark:text-white">Cover Photo</h4>
              <label htmlFor="files2">
                <span className="text-lg text-blue-600 font-bold hover:bg-gray-300 px-3 py-1 rounded-md cursor-pointer ">
                  Update
                </span>
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
            </div>

            <div className="flex justify-center">
              <Image
                className="object-cover"
                src={
                  preCoverImg ||
                  data.coverImage ||
                  "https://i.ibb.co/pWc2Ffd/u-bg.jpg"
                }
                alt="profile image"
                width="500"
                height="200"
              />
            </div>
            <div className="flex flex-col space-y-1 py-6 px-2">
              <div className="text-lg font-medium dark:text-white">
                Chenge First Name:
              </div>
              <input
                placeholder={data.firstName}
                defaultValue={data.firstName}
                className="w-full h-10  focus:outline-none dark:bg-transparent rounded-lg dark:text-white"
                type="text"
                {...register("firstName")}
              />
            </div>
            <div className="flex flex-col space-y-1 py-6 px-2">
              <div className="text-lg font-medium dark:text-white">
                Chenge Last Name:
              </div>
              <input
                placeholder={data.lastName}
                defaultValue={data.lastName}
                className="w-full h-10  focus:outline-none dark:bg-transparent rounded-lg dark:text-white"
                type="text"
                {...register("lastName")}
              />
            </div>
            <div className="mt-3 flex justify-end space-x-3 pb-5">
              <button className="px-8 py-2.5 bg-black text-gray-200 dark:hover:bg-opacity-50 rounded-md">
                Update
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
