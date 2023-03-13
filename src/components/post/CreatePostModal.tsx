import React from "react";
import { useStoreOpenModal } from "../../store/state";
import Image from "next/image";
const CreatePostModal: React.FC = () => {
  const { setOpen } = useStoreOpenModal();
  return (
    <>
      <div
        className={`absolute inset-0 flex h-screen w-full items-start justify-center bg-black bg-opacity-30 pt-10 md:items-center md:pt-0`}>
        <div className="relative h-1/2 w-10/12 transform rounded bg-white shadow-lg transition-opacity duration-300 md:h-3/4 md:w-1/2">
          {/* header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-xl text-center font-semibold text-gray-600">
              Title
            </h2>
            <div className="flex items-center space-x-2 p-2.5 px-4">
              <div>
                <Image
                  className="w-8 h-8 rounded-full"
                  src="https://random.imagecdn.app/200/200"
                  alt="user"
                  width={"200"}
                  height={"200"}
                />
              </div>
              <div>
                <p className="text-sm font-semibold">Saiful Islam Shihab</p>
              </div>
            </div>
          </div>
          {/* body */}
          <div className="w-full p-3">
            <div className="flex justify-center">
              <textarea
                className="peer block min-h-[auto] w-full rounded border-0 bg-transparent py-[0.32rem] px-3 leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-neutral-200 dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                rows={7}
                placeholder="Your message"
                defaultValue={""}
              />
            </div>
          </div>

          {/* footer */}
          <div className="absolute bottom-0 left-0 flex w-full items-center justify-end gap-3 border-t border-gray-200 px-4 py-3">
            <button className="flex-1 flex items-center h-8 focus:outline-none focus:bg-gray-200 justify-center space-x-2 hover:bg-gray-100 rounded-md">
              <div>
                <i className="fab fa-youtube text-red-400"></i>
              </div>
              <div>
                <p className="font-semibold">Create Video</p>
              </div>
            </button>
            <button className="flex-1 flex items-center h-8 focus:outline-none focus:bg-gray-200 justify-center space-x-2 hover:bg-gray-100 rounded-md">
              <div>
                <i className="fas fa-images text-green-500"></i>
              </div>
              <div>
                <p className="font-semibold">Photos/Video</p>
              </div>
            </button>
            <button className="flex-1 flex items-center h-8 focus:outline-none focus:bg-gray-200 justify-center space-x-2 hover:bg-gray-100 rounded-md">
              <div>
                <i className="far fa-smile text-yellow-500"></i>
              </div>
              <div>
                <p className="font-semibold">Feeling/Activity</p>
              </div>
            </button>

            <button className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800">
              Publish post
            </button>
            <button
              onClick={() => {
                setOpen(false);
              }}
              className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600 focus:outline-none">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePostModal;
