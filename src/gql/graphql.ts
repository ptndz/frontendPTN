/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The javascript `Date` as string. Type represents date and time as the ISO Date string. */
  DateTime: any;
};

export type BookmarkResponse = IMutationResponse & {
  __typename?: "BookmarkResponse";
  bookmarks?: Maybe<Array<IBookmark>>;
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type CommentResponse = IMutationResponse & {
  __typename?: "CommentResponse";
  code: Scalars["Float"];
  comment?: Maybe<IComment>;
  comments?: Maybe<Array<IComment>>;
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type CreatePostInput = {
  content: Scalars["String"];
  images?: InputMaybe<Array<Scalars["String"]>>;
};

export type FieldError = {
  __typename?: "FieldError";
  field: Scalars["String"];
  message: Scalars["String"];
};

export type FriendQueryResponse = IMutationResponse & {
  __typename?: "FriendQueryResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  friends?: Maybe<Array<Friends>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
  users?: Maybe<Array<User>>;
};

export type Friends = {
  __typename?: "Friends";
  createAt: Scalars["DateTime"];
  id: Scalars["ID"];
  status: Scalars["String"];
};

export type IBookmark = {
  __typename?: "IBookmark";
  createAt: Scalars["DateTime"];
  id: Scalars["Float"];
  post: IPost;
  user: IUser;
};

export type IComment = {
  __typename?: "IComment";
  comments?: Maybe<Array<IComment>>;
  content: Scalars["String"];
  id: Scalars["Float"];
  likes?: Maybe<Array<ILike>>;
  user: IUser;
};

export type ILike = {
  __typename?: "ILike";
  id: Scalars["Float"];
  reactions: Scalars["String"];
  user: IUser;
};

export type IMutationResponse = {
  code: Scalars["Float"];
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type IPost = {
  __typename?: "IPost";
  comments?: Maybe<Array<IComment>>;
  content: Scalars["String"];
  createAt: Scalars["DateTime"];
  images?: Maybe<Array<Scalars["String"]>>;
  likes?: Maybe<Array<ILike>>;
  shares: Scalars["Float"];
  updateAt: Scalars["DateTime"];
  user: IUser;
  uuid: Scalars["String"];
};

export type IUser = {
  __typename?: "IUser";
  avatar: Scalars["String"];
  fullName: Scalars["String"];
  id: Scalars["String"];
  username: Scalars["String"];
};

export type ImageLink = {
  __typename?: "ImageLink";
  alt: Scalars["String"];
  link: Scalars["String"];
};

export type ImageResponse = IMutationResponse & {
  __typename?: "ImageResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  images?: Maybe<Array<ImageLink>>;
  limit?: Maybe<Scalars["Float"]>;
  message?: Maybe<Scalars["String"]>;
  start?: Maybe<Scalars["Float"]>;
  success: Scalars["Boolean"];
};

export type LikeResponse = IMutationResponse & {
  __typename?: "LikeResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  like?: Maybe<ILike>;
  likes?: Maybe<Array<ILike>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
};

export type LoginInput = {
  password: Scalars["String"];
  usernameOrEmail: Scalars["String"];
};

export type Mutation = {
  __typename?: "Mutation";
  commentComment: CommentResponse;
  commentPost: CommentResponse;
  createPost: PostMutationResponse;
  deletePost: PostMutationResponse;
  likeComment: LikeResponse;
  likePost: LikeResponse;
  login: UserMutationResponse;
  logout: Scalars["Boolean"];
  register: UserMutationResponse;
  resetPassword: Scalars["Boolean"];
  updatePost: PostMutationResponse;
  updateProfile: ProfileResponse;
  updateUser: UserMutationResponse;
};

export type MutationCommentCommentArgs = {
  commentId: Scalars["Float"];
  content: Scalars["String"];
};

export type MutationCommentPostArgs = {
  content: Scalars["String"];
  postUuid: Scalars["String"];
};

export type MutationCreatePostArgs = {
  createPostInput: CreatePostInput;
};

export type MutationDeletePostArgs = {
  uuid: Scalars["String"];
};

export type MutationLikeCommentArgs = {
  commentId: Scalars["Float"];
  typeReact: Scalars["String"];
};

export type MutationLikePostArgs = {
  postUuid: Scalars["String"];
  typeReact: Scalars["String"];
};

export type MutationLoginArgs = {
  loginInput: LoginInput;
};

export type MutationRegisterArgs = {
  registerInput: RegisterInput;
};

export type MutationResetPasswordArgs = {
  password: Scalars["String"];
  token: Scalars["String"];
};

export type MutationUpdatePostArgs = {
  updatePostInput: UpdatePostInput;
};

export type MutationUpdateProfileArgs = {
  profileInput: ProfileInput;
};

export type MutationUpdateUserArgs = {
  updateUserInput: UpdateUserInput;
};

export type Post = {
  __typename?: "Post";
  content: Scalars["String"];
  createAt: Scalars["DateTime"];
  images: Array<Scalars["String"]>;
  shares: Scalars["Float"];
  updateAt: Scalars["DateTime"];
  uuid: Scalars["String"];
};

export type PostMutationResponse = IMutationResponse & {
  __typename?: "PostMutationResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  post?: Maybe<Post>;
  success: Scalars["Boolean"];
};

export type PostQueryResponse = IMutationResponse & {
  __typename?: "PostQueryResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  post?: Maybe<IPost>;
  posts?: Maybe<Array<IPost>>;
  success: Scalars["Boolean"];
};

export type PostsQueryResponse = IMutationResponse & {
  __typename?: "PostsQueryResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  limit?: Maybe<Scalars["Float"]>;
  message?: Maybe<Scalars["String"]>;
  page?: Maybe<Scalars["Float"]>;
  posts?: Maybe<Array<IPost>>;
  success: Scalars["Boolean"];
};

export type ProfileInput = {
  city: Scalars["String"];
  education: Scalars["String"];
  from: Scalars["String"];
  relationship: Scalars["String"];
  workplace: Scalars["String"];
};

export type ProfileResponse = IMutationResponse & {
  __typename?: "ProfileResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  profile?: Maybe<ProfileUser>;
  success: Scalars["Boolean"];
};

export type ProfileUser = {
  __typename?: "ProfileUser";
  city: Scalars["String"];
  education: Scalars["String"];
  from: Scalars["String"];
  id: Scalars["Float"];
  relationship: Scalars["String"];
  updateAt: Scalars["DateTime"];
  workplace: Scalars["String"];
};

export type Query = {
  __typename?: "Query";
  bookmarkAll: BookmarkResponse;
  createBookmark: BookmarkResponse;
  forgotPassword: Scalars["Boolean"];
  friends: FriendQueryResponse;
  getCommentComment: CommentResponse;
  getCommentPost: CommentResponse;
  getLikeComment: LikeResponse;
  getLikePost: LikeResponse;
  getListImageUser: ImageResponse;
  getPostsUserByUserName?: Maybe<PostsQueryResponse>;
  getUser: UserMutationResponse;
  getUsers: UserQueryResponse;
  hello: Scalars["String"];
  post?: Maybe<PostQueryResponse>;
  posts: PostsQueryResponse;
  profile: ProfileResponse;
  profileByUser: ProfileResponse;
  user: UserMutationResponse;
};

export type QueryCreateBookmarkArgs = {
  postUuid: Scalars["String"];
};

export type QueryForgotPasswordArgs = {
  email: Scalars["String"];
};

export type QueryGetCommentCommentArgs = {
  commentId: Scalars["Float"];
};

export type QueryGetCommentPostArgs = {
  postUuid: Scalars["String"];
};

export type QueryGetLikeCommentArgs = {
  commentId: Scalars["Float"];
};

export type QueryGetLikePostArgs = {
  postUuid: Scalars["String"];
};

export type QueryGetListImageUserArgs = {
  date: Scalars["String"];
  limit: Scalars["Float"];
  start: Scalars["Float"];
};

export type QueryGetPostsUserByUserNameArgs = {
  limit: Scalars["Float"];
  page: Scalars["Float"];
  username: Scalars["String"];
};

export type QueryGetUserArgs = {
  username: Scalars["String"];
};

export type QueryPostArgs = {
  uuid: Scalars["String"];
};

export type QueryPostsArgs = {
  limit: Scalars["Float"];
  page: Scalars["Float"];
};

export type QueryProfileByUserArgs = {
  username: Scalars["String"];
};

export type RegisterInput = {
  avatar: Scalars["String"];
  birthday: Scalars["String"];
  coverImage: Scalars["String"];
  email: Scalars["String"];
  firstName: Scalars["String"];
  fullName: Scalars["String"];
  lastName: Scalars["String"];
  password: Scalars["String"];
  phone: Scalars["String"];
  sex: Scalars["Boolean"];
  username: Scalars["String"];
};

export type UpdatePostInput = {
  content: Scalars["String"];
  images?: InputMaybe<Array<Scalars["String"]>>;
  uuid: Scalars["String"];
};

export type UpdateUserInput = {
  avatar: Scalars["String"];
  coverImage: Scalars["String"];
  firstName: Scalars["String"];
  fullName: Scalars["String"];
  lastName: Scalars["String"];
};

export type User = {
  __typename?: "User";
  avatar: Scalars["String"];
  birthday: Scalars["String"];
  coverImage: Scalars["String"];
  createAt: Scalars["DateTime"];
  email: Scalars["String"];
  firstName: Scalars["String"];
  fullName: Scalars["String"];
  id: Scalars["String"];
  lastName: Scalars["String"];
  phone: Scalars["String"];
  role: Scalars["String"];
  sex: Scalars["Boolean"];
  updateAt: Scalars["DateTime"];
  username: Scalars["String"];
};

export type UserMutationResponse = IMutationResponse & {
  __typename?: "UserMutationResponse";
  accessToken?: Maybe<Scalars["String"]>;
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
  user?: Maybe<User>;
};

export type UserQueryResponse = IMutationResponse & {
  __typename?: "UserQueryResponse";
  code: Scalars["Float"];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars["String"]>;
  success: Scalars["Boolean"];
  users?: Maybe<Array<User>>;
};

export type CreatePostMutationVariables = Exact<{
  content: Scalars["String"];
  images: Array<Scalars["String"]> | Scalars["String"];
}>;

export type CreatePostMutation = {
  __typename?: "Mutation";
  createPost: {
    __typename?: "PostMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    post?: {
      __typename?: "Post";
      uuid: string;
      content: string;
      createAt: any;
      updateAt: any;
      images: Array<string>;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      field: string;
      message: string;
    }> | null;
  };
};

export type GetUsersQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersQuery = {
  __typename?: "Query";
  getUsers: {
    __typename?: "UserQueryResponse";
    code: number;
    success: boolean;
    message?: string | null;
    users?: Array<{
      __typename?: "User";
      id: string;
      fullName: string;
      avatar: string;
      username: string;
    }> | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
  };
};

export type CommentPostMutationVariables = Exact<{
  postUuid: Scalars["String"];
  content: Scalars["String"];
}>;

export type CommentPostMutation = {
  __typename?: "Mutation";
  commentPost: {
    __typename?: "CommentResponse";
    code: number;
    success: boolean;
    message?: string | null;
    comment?: {
      __typename?: "IComment";
      id: number;
      content: string;
      user: {
        __typename?: "IUser";
        id: string;
        username: string;
        fullName: string;
        avatar: string;
      };
      likes?: Array<{
        __typename?: "ILike";
        id: number;
        reactions: string;
        user: {
          __typename?: "IUser";
          id: string;
          username: string;
          fullName: string;
          avatar: string;
        };
      }> | null;
    } | null;
    comments?: Array<{
      __typename?: "IComment";
      id: number;
      content: string;
      user: {
        __typename?: "IUser";
        id: string;
        username: string;
        fullName: string;
        avatar: string;
      };
      likes?: Array<{
        __typename?: "ILike";
        id: number;
        reactions: string;
        user: {
          __typename?: "IUser";
          id: string;
          username: string;
          fullName: string;
          avatar: string;
        };
      }> | null;
    }> | null;
  };
};

export type LikePostMutationVariables = Exact<{
  postUuid: Scalars["String"];
  typeReact: Scalars["String"];
}>;

export type LikePostMutation = {
  __typename?: "Mutation";
  likePost: {
    __typename?: "LikeResponse";
    code: number;
    success: boolean;
    message?: string | null;
    like?: {
      __typename?: "ILike";
      id: number;
      reactions: string;
      user: { __typename?: "IUser"; fullName: string; username: string };
    } | null;
  };
};

export type DeletePostMutationVariables = Exact<{
  uuid: Scalars["String"];
}>;

export type DeletePostMutation = {
  __typename?: "Mutation";
  deletePost: {
    __typename?: "PostMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    post?: {
      __typename?: "Post";
      uuid: string;
      content: string;
      createAt: any;
      updateAt: any;
      images: Array<string>;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      field: string;
      message: string;
    }> | null;
  };
};

export type CreateBookmarkQueryVariables = Exact<{
  postUuid: Scalars["String"];
}>;

export type CreateBookmarkQuery = {
  __typename?: "Query";
  createBookmark: {
    __typename?: "BookmarkResponse";
    code: number;
    success: boolean;
    bookmarks?: Array<{
      __typename?: "IBookmark";
      user: {
        __typename?: "IUser";
        username: string;
        fullName: string;
        avatar: string;
      };
      post: {
        __typename?: "IPost";
        uuid: string;
        content: string;
        createAt: any;
        updateAt: any;
        shares: number;
        images?: Array<string> | null;
        user: { __typename?: "IUser"; username: string; fullName: string };
        likes?: Array<{
          __typename?: "ILike";
          id: number;
          reactions: string;
        }> | null;
        comments?: Array<{
          __typename?: "IComment";
          id: number;
          content: string;
        }> | null;
      };
    }> | null;
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { __typename?: "Mutation"; logout: boolean };

export type BookmarkAllQueryVariables = Exact<{ [key: string]: never }>;

export type BookmarkAllQuery = {
  __typename?: "Query";
  bookmarkAll: {
    __typename?: "BookmarkResponse";
    code: number;
    success: boolean;
    bookmarks?: Array<{
      __typename?: "IBookmark";
      id: number;
      createAt: any;
      user: {
        __typename?: "IUser";
        id: string;
        username: string;
        fullName: string;
        avatar: string;
      };
      post: {
        __typename?: "IPost";
        uuid: string;
        content: string;
        createAt: any;
        updateAt: any;
        shares: number;
        images?: Array<string> | null;
        user: {
          __typename?: "IUser";
          id: string;
          username: string;
          avatar: string;
          fullName: string;
        };
        likes?: Array<{
          __typename?: "ILike";
          id: number;
          reactions: string;
          user: {
            __typename?: "IUser";
            id: string;
            username: string;
            avatar: string;
            fullName: string;
          };
        }> | null;
        comments?: Array<{
          __typename?: "IComment";
          id: number;
          content: string;
          user: {
            __typename?: "IUser";
            id: string;
            username: string;
            avatar: string;
            fullName: string;
          };
        }> | null;
      };
    }> | null;
  };
};

export type PostsQueryVariables = Exact<{
  page: Scalars["Float"];
  limit: Scalars["Float"];
}>;

export type PostsQuery = {
  __typename?: "Query";
  posts: {
    __typename?: "PostsQueryResponse";
    code: number;
    success: boolean;
    message?: string | null;
    page?: number | null;
    limit?: number | null;
    posts?: Array<{
      __typename?: "IPost";
      uuid: string;
      content: string;
      createAt: any;
      updateAt: any;
      shares: number;
      images?: Array<string> | null;
      user: {
        __typename?: "IUser";
        id: string;
        avatar: string;
        username: string;
        fullName: string;
      };
      likes?: Array<{
        __typename?: "ILike";
        id: number;
        reactions: string;
        user: {
          __typename?: "IUser";
          id: string;
          avatar: string;
          username: string;
          fullName: string;
        };
      }> | null;
      comments?: Array<{
        __typename?: "IComment";
        id: number;
        content: string;
        user: {
          __typename?: "IUser";
          id: string;
          avatar: string;
          username: string;
          fullName: string;
        };
      }> | null;
    }> | null;
  };
};

export type PostQueryVariables = Exact<{
  uuid: Scalars["String"];
}>;

export type PostQuery = {
  __typename?: "Query";
  post?: {
    __typename?: "PostQueryResponse";
    code: number;
    success: boolean;
    message?: string | null;
    post?: {
      __typename?: "IPost";
      uuid: string;
      content: string;
      createAt: any;
      updateAt: any;
      shares: number;
      images?: Array<string> | null;
      user: {
        __typename?: "IUser";
        id: string;
        avatar: string;
        username: string;
        fullName: string;
      };
      likes?: Array<{
        __typename?: "ILike";
        id: number;
        reactions: string;
        user: {
          __typename?: "IUser";
          id: string;
          avatar: string;
          username: string;
          fullName: string;
        };
      }> | null;
      comments?: Array<{
        __typename?: "IComment";
        id: number;
        content: string;
        user: {
          __typename?: "IUser";
          id: string;
          avatar: string;
          username: string;
          fullName: string;
        };
      }> | null;
    } | null;
  } | null;
};

export type GetPostsUserByUserNameQueryVariables = Exact<{
  username: Scalars["String"];
  page: Scalars["Float"];
  limit: Scalars["Float"];
}>;

export type GetPostsUserByUserNameQuery = {
  __typename?: "Query";
  getPostsUserByUserName?: {
    __typename?: "PostsQueryResponse";
    code: number;
    success: boolean;
    message?: string | null;
    page?: number | null;
    limit?: number | null;
    posts?: Array<{
      __typename?: "IPost";
      uuid: string;
      content: string;
      createAt: any;
      updateAt: any;
      shares: number;
      images?: Array<string> | null;
      user: {
        __typename?: "IUser";
        id: string;
        avatar: string;
        username: string;
        fullName: string;
      };
      likes?: Array<{
        __typename?: "ILike";
        id: number;
        reactions: string;
        user: {
          __typename?: "IUser";
          id: string;
          avatar: string;
          username: string;
          fullName: string;
        };
      }> | null;
      comments?: Array<{
        __typename?: "IComment";
        id: number;
        content: string;
        user: {
          __typename?: "IUser";
          id: string;
          avatar: string;
          username: string;
          fullName: string;
        };
      }> | null;
    }> | null;
  } | null;
};

export type UserQueryVariables = Exact<{ [key: string]: never }>;

export type UserQuery = {
  __typename?: "Query";
  user: {
    __typename?: "UserMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    user?: {
      __typename?: "User";
      id: string;
      fullName: string;
      lastName: string;
      firstName: string;
      username: string;
      email: string;
      avatar: string;
      coverImage: string;
      phone: string;
      birthday: string;
      sex: boolean;
      role: string;
      createAt: any;
      updateAt: any;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
  };
};

export type GetUserQueryVariables = Exact<{
  username: Scalars["String"];
}>;

export type GetUserQuery = {
  __typename?: "Query";
  getUser: {
    __typename?: "UserMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    user?: {
      __typename?: "User";
      id: string;
      fullName: string;
      lastName: string;
      firstName: string;
      username: string;
      email: string;
      avatar: string;
      coverImage: string;
      phone: string;
      birthday: string;
      sex: boolean;
      role: string;
      createAt: any;
      updateAt: any;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
  };
};

export type LoginMutationVariables = Exact<{
  email: Scalars["String"];
  password: Scalars["String"];
}>;

export type LoginMutation = {
  __typename?: "Mutation";
  login: {
    __typename?: "UserMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    accessToken?: string | null;
    user?: {
      __typename?: "User";
      id: string;
      fullName: string;
      lastName: string;
      firstName: string;
      username: string;
      email: string;
      avatar: string;
      phone: string;
      birthday: string;
      sex: boolean;
      role: string;
      coverImage: string;
      createAt: any;
      updateAt: any;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
  };
};

export type RegisterMutationVariables = Exact<{
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
  username: Scalars["String"];
  fullName: Scalars["String"];
  phone: Scalars["String"];
  birthday: Scalars["String"];
  sex: Scalars["Boolean"];
  avatar: Scalars["String"];
  coverImage: Scalars["String"];
}>;

export type RegisterMutation = {
  __typename?: "Mutation";
  register: {
    __typename?: "UserMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    accessToken?: string | null;
    user?: {
      __typename?: "User";
      id: string;
      fullName: string;
      lastName: string;
      firstName: string;
      username: string;
      email: string;
      avatar: string;
      phone: string;
      birthday: string;
      sex: boolean;
      role: string;
      coverImage: string;
      createAt: any;
      updateAt: any;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
  };
};

export type ResetPasswordMutationVariables = Exact<{
  password: Scalars["String"];
  token: Scalars["String"];
}>;

export type ResetPasswordMutation = {
  __typename?: "Mutation";
  resetPassword: boolean;
};

export type ForgotPasswordQueryVariables = Exact<{
  email: Scalars["String"];
}>;

export type ForgotPasswordQuery = {
  __typename?: "Query";
  forgotPassword: boolean;
};

export type ProfileQueryVariables = Exact<{ [key: string]: never }>;

export type ProfileQuery = {
  __typename?: "Query";
  profile: {
    __typename?: "ProfileResponse";
    profile?: {
      __typename?: "ProfileUser";
      id: number;
      city: string;
      education: string;
      relationship: string;
      from: string;
      workplace: string;
      updateAt: any;
    } | null;
  };
};

export type ProfileByUserQueryVariables = Exact<{
  username: Scalars["String"];
}>;

export type ProfileByUserQuery = {
  __typename?: "Query";
  profileByUser: {
    __typename?: "ProfileResponse";
    profile?: {
      __typename?: "ProfileUser";
      id: number;
      city: string;
      education: string;
      relationship: string;
      from: string;
      workplace: string;
      updateAt: any;
    } | null;
  };
};

export type UpdateProfileMutationVariables = Exact<{
  city: Scalars["String"];
  education: Scalars["String"];
  relationship: Scalars["String"];
  from: Scalars["String"];
  workplace: Scalars["String"];
}>;

export type UpdateProfileMutation = {
  __typename?: "Mutation";
  updateProfile: {
    __typename?: "ProfileResponse";
    code: number;
    success: boolean;
    message?: string | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
    profile?: {
      __typename?: "ProfileUser";
      id: number;
      city: string;
      education: string;
      relationship: string;
      from: string;
      workplace: string;
      updateAt: any;
    } | null;
  };
};

export type UpdateUserMutationVariables = Exact<{
  firstName: Scalars["String"];
  lastName: Scalars["String"];
  fullName: Scalars["String"];
  avatar: Scalars["String"];
  coverImage: Scalars["String"];
}>;

export type UpdateUserMutation = {
  __typename?: "Mutation";
  updateUser: {
    __typename?: "UserMutationResponse";
    code: number;
    success: boolean;
    message?: string | null;
    accessToken?: string | null;
    user?: {
      __typename?: "User";
      id: string;
      fullName: string;
      lastName: string;
      firstName: string;
      username: string;
      email: string;
      avatar: string;
      phone: string;
      birthday: string;
      sex: boolean;
      role: string;
      coverImage: string;
      createAt: any;
      updateAt: any;
    } | null;
    errors?: Array<{
      __typename?: "FieldError";
      message: string;
      field: string;
    }> | null;
  };
};

export const CreatePostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "createPost" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "content" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "images" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "ListType",
              type: {
                kind: "NonNullType",
                type: {
                  kind: "NamedType",
                  name: { kind: "Name", value: "String" },
                },
              },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createPost" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "createPostInput" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "content" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "content" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "images" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "images" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "post" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "uuid" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "images" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreatePostMutation, CreatePostMutationVariables>;
export const GetUsersDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getUsers" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getUsers" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "users" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fullName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "username" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUsersQuery, GetUsersQueryVariables>;
export const CommentPostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "commentPost" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "postUuid" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "content" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "commentPost" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "postUuid" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "postUuid" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "content" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "content" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "comment" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "likes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reactions" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "comments" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "likes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reactions" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CommentPostMutation, CommentPostMutationVariables>;
export const LikePostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "likePost" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "postUuid" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "typeReact" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "likePost" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "postUuid" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "postUuid" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "typeReact" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "typeReact" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "like" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "reactions" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LikePostMutation, LikePostMutationVariables>;
export const DeletePostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "deletePost" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "uuid" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "deletePost" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "uuid" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "uuid" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "post" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "uuid" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "images" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<DeletePostMutation, DeletePostMutationVariables>;
export const CreateBookmarkDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "createBookmark" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "postUuid" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "createBookmark" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "postUuid" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "postUuid" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "bookmarks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "post" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "uuid" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updateAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "shares" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "images" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "likes" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "reactions" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "comments" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "content" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<CreateBookmarkQuery, CreateBookmarkQueryVariables>;
export const LogoutDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "logout" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "logout" } },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const BookmarkAllDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "bookmarkAll" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "bookmarkAll" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "bookmarks" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "post" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "uuid" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "createAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "updateAt" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "shares" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "images" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "likes" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "reactions" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "user" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "username",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "avatar",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "fullName",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "comments" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "content" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "user" },
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "id" },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "username",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "avatar",
                                          },
                                        },
                                        {
                                          kind: "Field",
                                          name: {
                                            kind: "Name",
                                            value: "fullName",
                                          },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<BookmarkAllQuery, BookmarkAllQueryVariables>;
export const PostsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "posts" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Float" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Float" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "posts" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "limit" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "limit" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "posts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "uuid" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "shares" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "images" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "likes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reactions" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "comments" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostsQuery, PostsQueryVariables>;
export const PostDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "post" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "uuid" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "post" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "uuid" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "uuid" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "post" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "uuid" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "shares" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "images" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "likes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reactions" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "comments" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<PostQuery, PostQueryVariables>;
export const GetPostsUserByUserNameDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getPostsUserByUserName" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "username" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "page" } },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Float" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "limit" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Float" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getPostsUserByUserName" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "username" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "username" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "page" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "page" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "limit" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "limit" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "page" } },
                { kind: "Field", name: { kind: "Name", value: "limit" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "posts" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "uuid" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "content" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "shares" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "images" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "user" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "avatar" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "username" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fullName" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "likes" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "reactions" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "comments" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "id" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "content" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "user" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "id" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "avatar" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "username" },
                                  },
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "fullName" },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  GetPostsUserByUserNameQuery,
  GetPostsUserByUserNameQueryVariables
>;
export const UserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "user" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "user" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fullName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "firstName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "username" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "coverImage" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "phone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "birthday" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "sex" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const GetUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "getUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "username" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "getUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "username" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "username" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fullName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "firstName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "username" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "coverImage" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "phone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "birthday" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "sex" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<GetUserQuery, GetUserQueryVariables>;
export const LoginDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "login" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "email" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "password" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "login" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "loginInput" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "usernameOrEmail" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "email" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "password" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "password" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fullName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "firstName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "username" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "phone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "birthday" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "sex" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "coverImage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "register" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "firstName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "lastName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "email" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "password" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "username" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "fullName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "phone" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "birthday" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "sex" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "Boolean" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "avatar" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "coverImage" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "register" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "registerInput" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "firstName" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "firstName" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "lastName" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "lastName" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "email" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "email" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "password" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "password" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "username" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "username" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "fullName" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "fullName" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "phone" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "phone" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "birthday" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "birthday" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "sex" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "sex" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "avatar" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "avatar" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "coverImage" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "coverImage" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fullName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "firstName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "username" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "phone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "birthday" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "sex" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "coverImage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const ResetPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "resetPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "password" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "token" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "resetPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "password" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "password" },
                },
              },
              {
                kind: "Argument",
                name: { kind: "Name", value: "token" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "token" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const ForgotPasswordDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "forgotPassword" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "email" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "forgotPassword" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "email" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "email" },
                },
              },
            ],
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ForgotPasswordQuery, ForgotPasswordQueryVariables>;
export const ProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "profile" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "profile" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "profile" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "city" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "education" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "relationship" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "from" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "workplace" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProfileQuery, ProfileQueryVariables>;
export const ProfileByUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "profileByUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "username" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "profileByUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "username" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "username" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "profile" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "city" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "education" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "relationship" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "from" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "workplace" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<ProfileByUserQuery, ProfileByUserQueryVariables>;
export const UpdateProfileDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateProfile" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "city" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "education" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "relationship" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: { kind: "Variable", name: { kind: "Name", value: "from" } },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "workplace" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateProfile" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "profileInput" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "city" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "city" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "education" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "education" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "relationship" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "relationship" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "from" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "from" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "workplace" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "workplace" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "profile" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      { kind: "Field", name: { kind: "Name", value: "city" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "education" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "relationship" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "from" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "workplace" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const UpdateUserDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "mutation",
      name: { kind: "Name", value: "updateUser" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "firstName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "lastName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "fullName" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "avatar" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "coverImage" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "updateUser" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "updateUserInput" },
                value: {
                  kind: "ObjectValue",
                  fields: [
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "firstName" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "firstName" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "lastName" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "lastName" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "avatar" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "avatar" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "coverImage" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "coverImage" },
                      },
                    },
                    {
                      kind: "ObjectField",
                      name: { kind: "Name", value: "fullName" },
                      value: {
                        kind: "Variable",
                        name: { kind: "Name", value: "fullName" },
                      },
                    },
                  ],
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
                { kind: "Field", name: { kind: "Name", value: "accessToken" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "user" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      { kind: "Field", name: { kind: "Name", value: "id" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "fullName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "lastName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "firstName" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "username" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "email" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "avatar" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "phone" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "birthday" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "sex" } },
                      { kind: "Field", name: { kind: "Name", value: "role" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "coverImage" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "createAt" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "updateAt" },
                      },
                    ],
                  },
                },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "errors" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "message" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "field" } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UpdateUserMutation, UpdateUserMutationVariables>;
