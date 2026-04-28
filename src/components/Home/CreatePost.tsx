import React, { useEffect, useRef, useState } from "react";
import autosize from "autosize";
import { BsX } from "react-icons/bs";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import { HiPaperAirplane } from "react-icons/hi2";
import Image from "next/image";
import axios from "axios";
import { toast } from "react-toastify";
import jsonP from "@ptndev/json";
import { useStoreUser } from "../../store/user";
import { mutationCreatePost } from "../../graphql/post";
import { graphQLClient, graphQLClientErrorCheck } from "../../plugins/graphql.plugin";

interface IProps {
  setNewPost: (newPost: boolean) => void;
}

const CreatePost: React.FC<IProps> = ({ setNewPost }) => {
  const [postImages, setPostImages] = useState<File[]>();
  const [postImagePreview, setPostImagePreview] = useState<string[]>();
  const [postContents, setPostContents] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const filePickerRef = useRef<HTMLInputElement>(null);
  const { user } = useStoreUser();

  useEffect(() => {
    if (textareaRef.current) autosize(textareaRef.current);
  }, [postContents]);

  useEffect(() => {
    return () => { postImagePreview?.forEach(URL.revokeObjectURL); };
  }, [postImagePreview]);

  const onSubmit = async () => {
    toast("Posting...");
    const formData = new FormData();
    let imagesData: string[] = [];

    if (postImages) {
      postImages.forEach((image: File) => formData.append("images", image));
      const resImages = await axios.post("/image", formData);
      if (resImages.data.code === 200 && resImages.data.images) {
        imagesData = resImages.data.images;
      }
    }

    const resPost = await graphQLClient.request(mutationCreatePost, {
      content: jsonP.stringify(postContents),
      images: imagesData,
    });

    if (resPost.createPost.code !== 200) {
      toast(resPost.createPost.message);
      return;
    }
    if (graphQLClientErrorCheck(resPost)) {
      toast.success(resPost.createPost.message);
      setPostContents("");
      setPostImages(undefined);
      postImagePreview?.forEach(URL.revokeObjectURL);
      setPostImagePreview(undefined);
      setNewPost(true);
    }
  };

  const clearImages = () => {
    postImagePreview?.forEach(URL.revokeObjectURL);
    setPostImagePreview(undefined);
    setPostImages(undefined);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="p-4">
          <div className="flex gap-3">
            {/* Avatar */}
            <div className="relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt={user.fullName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-xl" />
              )}
            </div>

            {/* Textarea */}
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={postContents}
                onChange={(e) => setPostContents(e.target.value)}
                placeholder={`What's on your mind, ${user?.fullName?.split(" ")[0]}?`}
                rows={2}
                className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 border border-transparent focus:border-emerald-200 dark:focus:border-emerald-800 transition-all max-h-40 scrollbar-hide"
              />
            </div>
          </div>
        </div>

        {/* Image preview */}
        {postImagePreview && postImagePreview.length > 0 && (
          <div className="px-4 pb-3 space-y-2">
            {postImagePreview.map((image, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden h-56 bg-gray-100 dark:bg-gray-800">
                <Image src={image} alt="Preview" fill className="object-cover" />
              </div>
            ))}
            <button
              type="button"
              onClick={clearImages}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
            >
              <BsX className="text-base" /> Remove image
            </button>
          </div>
        )}

        {/* Action bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={() => filePickerRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <MdOutlinePhotoSizeSelectActual className="text-xl text-emerald-500" />
            Photo
          </button>
          <input
            ref={filePickerRef}
            accept="image/*"
            type="file"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;
              const images: string[] = [];
              for (let i = 0; i < files.length; i++) {
                images.push(URL.createObjectURL(files[i]));
              }
              setPostImagePreview((prev) => prev ? [...prev, ...images] : images);
              setPostImages((prev) => prev ? [...prev, files[0]] : [files[0]]);
            }}
          />

          <button
            type="submit"
            disabled={!postContents.trim() && !postImagePreview?.length}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-medium bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <HiPaperAirplane className="text-base" />
            Post
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
