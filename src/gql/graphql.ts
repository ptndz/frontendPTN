/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
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

export type Comment = {
  __typename?: 'Comment';
  content: Scalars['String'];
  createAt: Scalars['DateTime'];
  id: Scalars['ID'];
};

export type CommentResponse = IMutationResponse & {
  __typename?: 'CommentResponse';
  code: Scalars['Float'];
  comment?: Maybe<IComment>;
  comments?: Maybe<Array<IComment>>;
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type CreatePostInput = {
  content: Scalars['String'];
  images?: InputMaybe<Array<Scalars['String']>>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String'];
  message: Scalars['String'];
};

export type IComment = {
  __typename?: 'IComment';
  comments?: Maybe<Array<IComment>>;
  content: Scalars['String'];
  id: Scalars['Float'];
  likes?: Maybe<Array<ILike>>;
  user: IUser;
};

export type ILike = {
  __typename?: 'ILike';
  id: Scalars['Float'];
  reactions: Scalars['String'];
  user: IUser;
};

export type IMutationResponse = {
  code: Scalars['Float'];
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type IPost = {
  __typename?: 'IPost';
  comments?: Maybe<Array<Comment>>;
  content: Scalars['String'];
  createAt: Scalars['DateTime'];
  images?: Maybe<Array<Scalars['String']>>;
  likes?: Maybe<Array<Like>>;
  shares: Scalars['Float'];
  updateAt: Scalars['DateTime'];
  user: IUser;
  uuid: Scalars['String'];
};

export type IUser = {
  __typename?: 'IUser';
  avatar: Scalars['String'];
  fullName: Scalars['String'];
  username: Scalars['String'];
};

export type ImageLink = {
  __typename?: 'ImageLink';
  alt: Scalars['String'];
  link: Scalars['String'];
};

export type ImageResponse = IMutationResponse & {
  __typename?: 'ImageResponse';
  code: Scalars['Float'];
  errors?: Maybe<Array<FieldError>>;
  images?: Maybe<Array<ImageLink>>;
  limit?: Maybe<Scalars['Float']>;
  message?: Maybe<Scalars['String']>;
  start?: Maybe<Scalars['Float']>;
  success: Scalars['Boolean'];
};

export type Like = {
  __typename?: 'Like';
  createAt: Scalars['DateTime'];
  id: Scalars['ID'];
  reactions: Scalars['String'];
};

export type LikeResponse = IMutationResponse & {
  __typename?: 'LikeResponse';
  code: Scalars['Float'];
  errors?: Maybe<Array<FieldError>>;
  like?: Maybe<ILike>;
  likes?: Maybe<Array<ILike>>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
};

export type LoginInput = {
  password: Scalars['String'];
  usernameOrEmail: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  commentComment: CommentResponse;
  commentPost: CommentResponse;
  createPost: PostMutationResponse;
  deletePost: PostMutationResponse;
  likeComment: LikeResponse;
  likePost: LikeResponse;
  login: UserMutationResponse;
  logout: Scalars['Boolean'];
  register: UserMutationResponse;
  updatePost: PostMutationResponse;
};


export type MutationCommentCommentArgs = {
  commentId: Scalars['Float'];
  content: Scalars['String'];
};


export type MutationCommentPostArgs = {
  content: Scalars['String'];
  postUuid: Scalars['String'];
};


export type MutationCreatePostArgs = {
  createPostInput: CreatePostInput;
};


export type MutationDeletePostArgs = {
  uuid: Scalars['String'];
};


export type MutationLikeCommentArgs = {
  commentId: Scalars['Float'];
  typeReact: Scalars['String'];
};


export type MutationLikePostArgs = {
  postUuid: Scalars['String'];
  typeReact: Scalars['String'];
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
  __typename?: 'Post';
  content: Scalars['String'];
  createAt: Scalars['DateTime'];
  images: Array<Scalars['String']>;
  shares: Scalars['Float'];
  updateAt: Scalars['DateTime'];
  uuid: Scalars['String'];
};

export type PostMutationResponse = IMutationResponse & {
  __typename?: 'PostMutationResponse';
  code: Scalars['Float'];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars['String']>;
  post?: Maybe<Post>;
  success: Scalars['Boolean'];
};

export type PostQueryResponse = IMutationResponse & {
  __typename?: 'PostQueryResponse';
  code: Scalars['Float'];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars['String']>;
  post?: Maybe<IPost>;
  posts?: Maybe<Array<IPost>>;
  success: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  getCommentComment: CommentResponse;
  getCommentPost: CommentResponse;
  getLikeComment: LikeResponse;
  getLikePost: LikeResponse;
  getListImageUser: ImageResponse;
  getPostsUserByUserName?: Maybe<PostQueryResponse>;
  getUser: UserMutationResponse;
  hello: Scalars['String'];
  post?: Maybe<PostQueryResponse>;
  posts?: Maybe<PostQueryResponse>;
  user: UserMutationResponse;
};


export type QueryGetCommentCommentArgs = {
  commentId: Scalars['Float'];
};


export type QueryGetCommentPostArgs = {
  postUuid: Scalars['String'];
};


export type QueryGetLikeCommentArgs = {
  commentId: Scalars['Float'];
};


export type QueryGetLikePostArgs = {
  postUuid: Scalars['String'];
};


export type QueryGetListImageUserArgs = {
  date: Scalars['String'];
  limit: Scalars['Float'];
  start: Scalars['Float'];
};


export type QueryGetPostsUserByUserNameArgs = {
  username: Scalars['String'];
};


export type QueryGetUserArgs = {
  username: Scalars['String'];
};


export type QueryPostArgs = {
  uuid: Scalars['String'];
};

export type RegisterInput = {
  avatar: Scalars['String'];
  birthday: Scalars['String'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  lastName: Scalars['String'];
  password: Scalars['String'];
  phone: Scalars['String'];
  sex: Scalars['Boolean'];
  username: Scalars['String'];
};

export type UpdatePostInput = {
  content: Scalars['String'];
  images?: InputMaybe<Array<Scalars['String']>>;
  uuid: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  avatar: Scalars['String'];
  birthday: Scalars['String'];
  createAt: Scalars['DateTime'];
  email: Scalars['String'];
  firstName: Scalars['String'];
  fullName: Scalars['String'];
  id: Scalars['ID'];
  lastName: Scalars['String'];
  phone: Scalars['String'];
  sex: Scalars['Boolean'];
  updateAt: Scalars['DateTime'];
  username: Scalars['String'];
};

export type UserMutationResponse = IMutationResponse & {
  __typename?: 'UserMutationResponse';
  accessToken?: Maybe<Scalars['String']>;
  code: Scalars['Float'];
  errors?: Maybe<Array<FieldError>>;
  message?: Maybe<Scalars['String']>;
  success: Scalars['Boolean'];
  user?: Maybe<User>;
};
