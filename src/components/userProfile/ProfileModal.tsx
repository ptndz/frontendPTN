import axios from "axios";
import Image from "next/image";
import React, { useState } from "react";

import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";

interface IProps {
  data: any;
  open: any;
  setOpenProfileModal: any;
  setUpdateUserData: any;
}

const ProfileModal: React.FC<IProps> = ({
  data,
  open,
  setOpenProfileModal,
  setUpdateUserData,
}) => {
  const { user } = useStoreUser();
  const [displayName, setDisplayName] = useState("");
  const [preProfileImg, setPreProfileImg] = useState(null);
  const [preCoverImg, setPreCoverImg] = useState(null);

  const [profileImg, setProfileImg] = useState([]);
  const [coverImg, setCoverImg] = useState(null);

  const [updating, setUpdating] = useState(false);

  // const handleProfileImg = (file) => {
  //   setProfileImg(file);
  //   setPreProfileImg(URL.createObjectURL(file));
  // };
  // const handleCoverImg = (file) => {
  //   setCoverImg(file);
  //   setPreCoverImg(URL.createObjectURL(file));
  // };
  let userData: User;

  const handleSubmit = async (e: any) => {
    setUpdating(true);
    setOpenProfileModal(false);
    e.preventDefault();
    if (displayName) {
      userData.avatar = displayName;
    }
    const formData = new FormData();
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
          <form onSubmit={handleSubmit}>
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
                  // onChange={(e) => handleProfileImg(e.target.files[0])}
                />
              </div>
            </div>
            <div className="flex justify-center">
              <Image
                className="object-cover rounded-full border-2 bg-no-repeat"
                src={
                  preProfileImg ||
                  data.photoURL ||
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
                // onChange={(e) => handleCoverImg(e.target.files[0])}
              />
            </div>

            <div className="flex justify-center">
              <Image
                className="object-cover"
                src={
                  preCoverImg ||
                  data.coverPicture ||
                  "https://i.ibb.co/pWc2Ffd/u-bg.jpg"
                }
                alt="profile image"
                width="500"
                height="200"
              />
            </div>
            <div className="flex flex-col space-y-1 py-6 px-2">
              <div className="text-lg font-medium dark:text-white">
                Chenge Your Name:
              </div>
              <input
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={data.displayName}
                defaultValue={data.displayName}
                className="w-full h-10  focus:outline-none dark:bg-transparent rounded-lg dark:text-white"
                type="text"
                name="name"
                id="name"
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
