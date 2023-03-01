import React from "react";
interface IProps {
  setOpenModal: (isOpen: boolean) => void;
}

const CreatePostModal: React.FC<IProps> = (props) => {
  const { setOpenModal } = props;

  return (
    <>
      <div
        className={`absolute inset-0 flex h-screen w-full items-start justify-center bg-black bg-opacity-30 pt-10 md:items-center md:pt-0`}>
        <div className="pacity-0 relative h-1/2 w-10/12 transform rounded bg-white shadow-lg transition-opacity transition-transform duration-300 md:h-3/4 md:w-1/2">
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            className="absolute -top-3 -right-3 h-10 w-10 rounded-full text-2xl text-white focus:outline-none">
            ❌
          </button>
          {/* header */}
          <div className="border-b border-gray-200 px-4 py-3">
            <h2 className="text-xl font-semibold text-gray-600">Title</h2>
          </div>
          {/* body */}
          <div className="w-full p-3">
            Lorem ipsum, dolor sit amet consectetur adipisicing elit.
            Asperiores, quis tempora! Similique, explicabo quaerat maxime
            corrupti tenetur blanditiis voluptas molestias totam? Quaerat
            laboriosam suscipit repellat aliquam blanditiis eum quos nihil.
          </div>
          {/* footer */}
          <div className="absolute bottom-0 left-0 flex w-full items-center justify-end gap-3 border-t border-gray-200 px-4 py-3">
            <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:outline-none">
              Save
            </button>
            <button
              onClick={() => {
                setOpenModal(false);
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
