import React from "react";
import { useForm } from "react-hook-form";
import Modal from "react-responsive-modal";
import "react-responsive-modal/styles.css";
import { toast } from "react-toastify";
import { ProfileUser } from "../../gql/graphql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";
import { queryUpdateProfile } from "../../graphql/user";

interface IProps {
  data: ProfileUser;
  openDetailsModal: boolean;
  setOpenDetailsModal: (openDetailsModal: boolean) => void;
  setUpdateUserData: (updateUserData: boolean) => void;
}

const inputClass =
  "w-full h-10 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 dark:focus:border-emerald-600 transition-all";

const AboutModal: React.FC<IProps> = ({
  data,
  openDetailsModal,
  setOpenDetailsModal,
  setUpdateUserData,
}) => {
  const { register, handleSubmit } = useForm();

  const onSubmit = async (formData: any) => {
    const res = await graphQLClient.request(queryUpdateProfile, {
      city: formData.city,
      education: formData.education,
      from: formData.from,
      relationship: formData.relationship,
      workplace: formData.workplace,
    });
    if (graphQLClientErrorCheck(res)) {
      setUpdateUserData(true);
      toast.success("Profile updated successfully");
      setOpenDetailsModal(false);
    }
  };

  return (
    <Modal
      open={openDetailsModal}
      onClose={() => setOpenDetailsModal(false)}
      center
      classNames={{ modal: "customModal !rounded-2xl !p-0 !bg-white dark:!bg-gray-900" }}
    >
      <div className="bg-white dark:bg-gray-900 w-full md:w-[480px]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Edit details</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Education</label>
            <input
              className={inputClass}
              type="text"
              {...register("education")}
              defaultValue={data?.education}
              placeholder="University, school..."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lives in</label>
            <input
              className={inputClass}
              type="text"
              {...register("city")}
              defaultValue={data?.city}
              placeholder="Current city"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">From</label>
            <input
              className={inputClass}
              type="text"
              {...register("from")}
              defaultValue={data?.from}
              placeholder="Hometown"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Workplace</label>
            <input
              className={inputClass}
              type="text"
              {...register("workplace")}
              defaultValue={data?.workplace}
              placeholder="Where you work"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</label>
            <select
              className={inputClass}
              {...register("relationship")}
              defaultValue={data?.relationship || "Single"}
            >
              <option value="Single">Single</option>
              <option value="In a relationship">In a relationship</option>
              <option value="Engaged">Engaged</option>
              <option value="Married">Married</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setOpenDetailsModal(false)}
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
  );
};

export default AboutModal;
