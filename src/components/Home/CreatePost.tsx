import React, { useEffect, useRef, useState } from "react";
import autosize from "autosize";
import { BsX } from "react-icons/bs";
import { BiMessageSquareEdit } from "react-icons/bi";
import { MdOutlinePhotoSizeSelectActual } from "react-icons/md";
import Image from "next/image";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import jsonP from "@ptndev/json";
import { useStoreUser } from "../../store/user";
import { graphql } from "../../gql";
import {
  graphQLClient,
  graphQLClientErrorCheck,
} from "../../plugins/graphql.plugin";

interface IProps {
  setNewPost: (newPost: boolean) => void;
}

const CreatePost: React.FC<IProps> = ({ setNewPost }) => {
  const [postImages, setPostImages] = useState<File[]>();
  const [postImagePreview, setPostImagePreview] = useState<string[]>();
  const [postContents, setPostContents] = useState("");

  const textareaRef = useRef<any>(null);
  const filePickerRef = useRef<any>(null);
  const { user } = useStoreUser();

  useEffect(() => {
    autosize(textareaRef.current);
  }, [postContents]);
  const queryPost = graphql(`
    mutation createPost($content: String!, $images: [String!]!) {
      createPost(createPostInput: { content: $content, images: $images }) {
        code
        success
        message
        post {
          uuid
          content
          createAt
          updateAt
          images
        }
        errors {
          field
          message
        }
      }
    }
  `);
  const { register, handleSubmit } = useForm();
  const onSubmit = async (data: any) => {
    toast("🦄 Posting....", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    const formData = new FormData();
    let imagesData: string[] = [];
    if (postImages) {
      postImages.map((image: File) => {
        formData.append("images", image);
      });

      const resImages = await axios.post("/image", formData);
      if (resImages.data.code === 200) {
        if (resImages.data.images) {
          imagesData = resImages.data.images;
        }
      }
    }
    const resPost = await graphQLClient.request(queryPost, {
      content: jsonP.stringify(postContents),
      images: imagesData ? imagesData : [],
    });
    if (resPost.createPost.code !== 200) {
      toast(resPost.createPost.message);
      return;
    }
    if (graphQLClientErrorCheck(resPost)) {
      toast.success(resPost.createPost.message);
      setPostContents("");
      setPostImages(undefined);
      setPostImagePreview(undefined);

      setNewPost(true);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="sm:rounded-lg bg-white dark:bg-black overflow-hidden">
        <div className="px-2 sm:px-4 pb-2 pt-5 sm:pb-6">
          <div className="flex gap-1 items-start">
            <div className="flex-shrink-0 relative mx-auto sm:h-14 sm:w-14 h-12 w-12 rounded-full overflow-hidden bg-gray-300 dark:bg-zinc-800">
              {user?.avatar && (
                <Image
                  src={user.avatar || "/images/user-avatar.png"}
                  alt={user.fullName}
                  layout="fill"
                  objectFit="cover"
                />
              )}
            </div>
            <div className="flex flex-col w-full space-y-2">
              <div className="pl-3">
                <h1 className="font-medium sm:text-lg leading-6">
                  {user?.fullName}
                </h1>
              </div>
              <textarea
                {...register("postContent")}
                id="postContent"
                ref={textareaRef}
                value={postContents}
                onChange={(e) => setPostContents(e.target.value)}
                placeholder="What's on your mind?"
                rows={2}
                className="w-full placeholder:text-sm dark:text-zinc-200 resize-none max-h-40 focus:outline-none focus:border-none focus:ring-0 bg-transparent border-none scrollbar-hide overflow-y-scroll scrollbar scroll-ml-5"></textarea>
            </div>
          </div>
        </div>
        {/* image preview */}
        {postImagePreview ? (
          <div className="relative w-full">
            {postImagePreview.map((image, index: number) => (
              <div className="sm:p-2" key={index}>
                <div className="relative h-72 w-full sm:rounded-lg overflow-hidden border border-gray-300 dark:border-zinc-600">
                  <Image
                    src={image}
                    alt="Pham Thanh Nam"
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              </div>
            ))}

            <button
              className="absolute top-3 right-1 mr-2.5"
              type="button"
              onClick={() => {
                setPostImagePreview(undefined);
                setPostImages(undefined);
              }}>
              <BsX className="h-5 w-5 box-content p-2 rounded-full bg-white border dark:border-zinc-600 dark:bg-zinc-700" />
            </button>
          </div>
        ) : (
          ""
        )}

        <div className="border m-2 rounded-lg overflow-hidden border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-black grid divide-gray-200 dark:divide-zinc-700 grid-cols-2 divide-y-0 divide-x">
          <button
            type="button"
            onClick={() => filePickerRef.current.click()}
            className="py-2.5 text-sm font-medium flex gap-2 items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800">
            <MdOutlinePhotoSizeSelectActual className="text-green-400 w-7 h-7" />
            <span className="hidden sm:block text-gray-600 dark:text-zinc-200">
              Image
            </span>
            <input
              ref={filePickerRef}
              accept="image/*"
              type="file"
              name="file"
              id="file"
              onChange={(e) => {
                const files = e.target.files;
                const images: any = [];
                if (files) {
                  for (let i = 0; i < files.length; i++) {
                    images.push(URL.createObjectURL(files[i]));
                  }

                  if (postImagePreview === undefined) {
                    setPostImagePreview([...images]);
                  }
                  if (postImagePreview) {
                    setPostImagePreview((result: any) => [
                      ...result,
                      ...images,
                    ]);
                  }
                  if (postImages === undefined) {
                    setPostImages([files[0]]);
                  }
                  if (postImages) {
                    setPostImages((result: any) => [...result, files[0]]);
                  }
                }
              }}
              className="hidden"
            />
          </button>
          <button
            disabled={
              !postContents && postImagePreview && postImagePreview.length > 0
            }
            type="submit"
            className="py-2.5 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:dark:hover:bg-transparent text-sm font-medium flex gap-2 items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800">
            <BiMessageSquareEdit className="text-red-500 w-7 h-7" />
            <span className="hidden sm:block text-gray-600 dark:text-zinc-200">
              Post
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
