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

export type IComment = {
  __typename?: "IComment";
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
  updatePost: PostMutationResponse;
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

export type MutationUpdatePostArgs = {
  updatePostInput: UpdatePostInput;
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

export type Query = {
  __typename?: "Query";
  getCommentComment: CommentResponse;
  getCommentPost: CommentResponse;
  getLikeComment: LikeResponse;
  getLikePost: LikeResponse;
  getListImageUser: ImageResponse;
  getPostsUserByUserName?: Maybe<PostQueryResponse>;
  getUser: UserMutationResponse;
  hello: Scalars["String"];
  post?: Maybe<PostQueryResponse>;
  posts: PostQueryResponse;
  user: UserMutationResponse;
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
  username: Scalars["String"];
};

export type QueryGetUserArgs = {
  username: Scalars["String"];
};

export type QueryPostArgs = {
  uuid: Scalars["String"];
};

export type RegisterInput = {
  avatar: Scalars["String"];
  birthday: Scalars["String"];
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

export type User = {
  __typename?: "User";
  avatar: Scalars["String"];
  birthday: Scalars["String"];
  createAt: Scalars["DateTime"];
  email: Scalars["String"];
  firstName: Scalars["String"];
  fullName: Scalars["String"];
  id: Scalars["ID"];
  lastName: Scalars["String"];
  phone: Scalars["String"];
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

export type PostsQueryVariables = Exact<{ [key: string]: never }>;

export type PostsQuery = {
  __typename?: "Query";
  posts: {
    __typename?: "PostQueryResponse";
    code: number;
    success: boolean;
    message?: string | null;
    posts?: Array<{
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
        user: { __typename?: "IUser"; username: string; fullName: string };
      }> | null;
      comments?: Array<{
        __typename?: "IComment";
        id: number;
        content: string;
        user: { __typename?: "IUser"; username: string; fullName: string };
      }> | null;
    }> | null;
  };
};

export const PostsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "posts" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "posts" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "code" } },
                { kind: "Field", name: { kind: "Name", value: "success" } },
                { kind: "Field", name: { kind: "Name", value: "message" } },
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
