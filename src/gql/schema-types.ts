export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type BookmarkResponse = {
  __typename?: 'BookmarkResponse';
  bookmarks?: Maybe<Array<Maybe<IBookmark>>>;
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type Category = {
  __typename?: 'Category';
  created_at?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

export type CategoryCreateInput = {
  created_at?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

export type CategoryPage = {
  __typename?: 'CategoryPage';
  data?: Maybe<Array<Maybe<Category>>>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type CategoryUpdateInput = {
  created_at?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

export type CommentResponse = {
  __typename?: 'CommentResponse';
  code: Scalars['Float']['output'];
  comment?: Maybe<IComment>;
  comments?: Maybe<Array<Maybe<IComment>>>;
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type CreatePostInput = {
  audience?: InputMaybe<Scalars['String']['input']>;
  content: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  poll?: InputMaybe<PollInput>;
};

export type FieldError = {
  __typename?: 'FieldError';
  field: Scalars['String']['output'];
  message: Scalars['String']['output'];
};

export type IBookmark = {
  __typename?: 'IBookmark';
  createAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['Float']['output'];
  post: IPost;
  user: IUser;
};

export type IComment = {
  __typename?: 'IComment';
  comments?: Maybe<Array<Maybe<IComment>>>;
  content: Scalars['String']['output'];
  id: Scalars['Float']['output'];
  likes?: Maybe<Array<Maybe<ILike>>>;
  user: IUser;
};

export type ILike = {
  __typename?: 'ILike';
  id: Scalars['Float']['output'];
  reactions: Scalars['String']['output'];
  user: IUser;
};

export type IPost = {
  __typename?: 'IPost';
  audience?: Maybe<Scalars['String']['output']>;
  comments?: Maybe<Array<Maybe<IComment>>>;
  commentsCount?: Maybe<Scalars['Float']['output']>;
  content: Scalars['String']['output'];
  createAt?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['String']['output']>;
  images?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  likes?: Maybe<Array<Maybe<ILike>>>;
  likesCount?: Maybe<Scalars['Float']['output']>;
  poll?: Maybe<Poll>;
  shares: Scalars['Float']['output'];
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updateAt?: Maybe<Scalars['String']['output']>;
  user: IUser;
  uuid: Scalars['String']['output'];
};

export type IUser = {
  __typename?: 'IUser';
  avatar: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  username: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type LikeResponse = {
  __typename?: 'LikeResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  like?: Maybe<ILike>;
  likes?: Maybe<Array<Maybe<ILike>>>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type LoginInput = {
  password: Scalars['String']['input'];
  usernameOrEmail: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  categoryCreate?: Maybe<Category>;
  categoryDelete?: Maybe<Scalars['Boolean']['output']>;
  categoryUpdate?: Maybe<Category>;
  commentComment: CommentResponse;
  commentPost: CommentResponse;
  createPost: PostMutationResponse;
  deletePost: PostMutationResponse;
  likeComment: LikeResponse;
  likePost: LikeResponse;
  login: UserMutationResponse;
  logout: Scalars['Boolean']['output'];
  productCreate?: Maybe<Product>;
  productDelete?: Maybe<Scalars['Boolean']['output']>;
  productUpdate?: Maybe<Product>;
  register: UserMutationResponse;
  resetPassword: Scalars['Boolean']['output'];
  updatePost: PostMutationResponse;
  updateProfile: ProfileResponse;
  updateUser: UserMutationResponse;
  verifyTwoFactorLogin: UserMutationResponse;
};


export type MutationCategoryCreateArgs = {
  data: CategoryCreateInput;
};


export type MutationCategoryDeleteArgs = {
  id: Scalars['Int']['input'];
};


export type MutationCategoryUpdateArgs = {
  data: CategoryUpdateInput;
  id: Scalars['Int']['input'];
};


export type MutationCommentCommentArgs = {
  commentId: Scalars['Float']['input'];
  content: Scalars['String']['input'];
};


export type MutationCommentPostArgs = {
  content: Scalars['String']['input'];
  postUuid: Scalars['String']['input'];
};


export type MutationCreatePostArgs = {
  createPostInput: CreatePostInput;
};


export type MutationDeletePostArgs = {
  uuid: Scalars['String']['input'];
};


export type MutationLikeCommentArgs = {
  commentId: Scalars['Float']['input'];
  typeReact: Scalars['String']['input'];
};


export type MutationLikePostArgs = {
  postUuid: Scalars['String']['input'];
  typeReact: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  loginInput: LoginInput;
};


export type MutationProductCreateArgs = {
  data: ProductCreateInput;
};


export type MutationProductDeleteArgs = {
  id: Scalars['Int']['input'];
};


export type MutationProductUpdateArgs = {
  data: ProductUpdateInput;
  id: Scalars['Int']['input'];
};


export type MutationRegisterArgs = {
  registerInput: RegisterInput;
};


export type MutationResetPasswordArgs = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
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


export type MutationVerifyTwoFactorLoginArgs = {
  code: Scalars['String']['input'];
  token: Scalars['String']['input'];
};

export type Poll = {
  __typename?: 'Poll';
  expiresAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  multiple: Scalars['Boolean']['output'];
  options?: Maybe<Array<Maybe<PollOption>>>;
  postUuid?: Maybe<Scalars['String']['output']>;
  question: Scalars['String']['output'];
  totalVotes: Scalars['Float']['output'];
  userVotedOptionIds?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type PollInput = {
  expiresAt?: InputMaybe<Scalars['String']['input']>;
  multiple?: InputMaybe<Scalars['Boolean']['input']>;
  options: Array<Scalars['String']['input']>;
  question: Scalars['String']['input'];
};

export type PollOption = {
  __typename?: 'PollOption';
  id: Scalars['String']['output'];
  text: Scalars['String']['output'];
  voteCount: Scalars['Float']['output'];
};

export type PollResponse = {
  __typename?: 'PollResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  poll?: Maybe<Poll>;
  success: Scalars['Boolean']['output'];
};

export type Post = {
  __typename?: 'Post';
  audience?: Maybe<Scalars['String']['output']>;
  content: Scalars['String']['output'];
  createAt?: Maybe<Scalars['String']['output']>;
  groupId?: Maybe<Scalars['String']['output']>;
  images: Array<Maybe<Scalars['String']['output']>>;
  shares: Scalars['Float']['output'];
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  updateAt?: Maybe<Scalars['String']['output']>;
  uuid: Scalars['String']['output'];
};

export type PostMutationResponse = {
  __typename?: 'PostMutationResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  post?: Maybe<Post>;
  success: Scalars['Boolean']['output'];
};

export type PostQueryResponse = {
  __typename?: 'PostQueryResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  post?: Maybe<IPost>;
  posts?: Maybe<Array<Maybe<IPost>>>;
  success: Scalars['Boolean']['output'];
};

export type PostsQueryResponse = {
  __typename?: 'PostsQueryResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  limit?: Maybe<Scalars['Float']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  page?: Maybe<Scalars['Float']['output']>;
  posts?: Maybe<Array<Maybe<IPost>>>;
  success: Scalars['Boolean']['output'];
};

export type Product = {
  __typename?: 'Product';
  attrs?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  updated_at?: Maybe<Scalars['String']['output']>;
};

export type ProductCreateInput = {
  attrs?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

export type ProductPage = {
  __typename?: 'ProductPage';
  data?: Maybe<Array<Maybe<Product>>>;
  total?: Maybe<Scalars['Int']['output']>;
};

export type ProductUpdateInput = {
  attrs?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updated_at?: InputMaybe<Scalars['String']['input']>;
};

export type ProfileInput = {
  city: Scalars['String']['input'];
  education: Scalars['String']['input'];
  from: Scalars['String']['input'];
  relationship: Scalars['String']['input'];
  workplace: Scalars['String']['input'];
};

export type ProfileResponse = {
  __typename?: 'ProfileResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<ProfileUser>;
  success: Scalars['Boolean']['output'];
};

export type ProfileUser = {
  __typename?: 'ProfileUser';
  city: Scalars['String']['output'];
  education: Scalars['String']['output'];
  from: Scalars['String']['output'];
  id: Scalars['Float']['output'];
  relationship: Scalars['String']['output'];
  updateAt?: Maybe<Scalars['String']['output']>;
  workplace: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  bookmarkAll: BookmarkResponse;
  categoryById?: Maybe<Category>;
  categoryCount?: Maybe<Scalars['Int']['output']>;
  categoryList?: Maybe<CategoryPage>;
  confirmation: Scalars['Boolean']['output'];
  createBookmark: BookmarkResponse;
  forgotPassword: Scalars['Boolean']['output'];
  friendRequest: UserQueryResponse;
  getAllPostIds: Array<Maybe<Scalars['String']['output']>>;
  getCommentComment: CommentResponse;
  getPostsUserByUserName?: Maybe<PostsQueryResponse>;
  getUser: UserMutationResponse;
  getUserByUuid: UserMutationResponse;
  getUsersYouMayKnow: UserQueryResponse;
  poll?: Maybe<PollResponse>;
  post?: Maybe<PostQueryResponse>;
  posts: PostsQueryResponse;
  productById?: Maybe<Product>;
  productCount?: Maybe<Scalars['Int']['output']>;
  productList?: Maybe<ProductPage>;
  profile: ProfileResponse;
  profileByUser: ProfileResponse;
  user: UserMutationResponse;
};


export type QueryCategoryByIdArgs = {
  id: Scalars['Int']['input'];
  include?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryCategoryCountArgs = {
  q?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCategoryListArgs = {
  include?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryConfirmationArgs = {
  token: Scalars['String']['input'];
};


export type QueryCreateBookmarkArgs = {
  postUuid: Scalars['String']['input'];
};


export type QueryForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type QueryGetCommentCommentArgs = {
  commentId: Scalars['Float']['input'];
};


export type QueryGetPostsUserByUserNameArgs = {
  limit: Scalars['Float']['input'];
  page: Scalars['Float']['input'];
  username: Scalars['String']['input'];
};


export type QueryGetUserArgs = {
  username: Scalars['String']['input'];
};


export type QueryGetUserByUuidArgs = {
  userUuid: Scalars['String']['input'];
};


export type QueryPollArgs = {
  id: Scalars['Float']['input'];
};


export type QueryPostArgs = {
  uuid: Scalars['String']['input'];
};


export type QueryPostsArgs = {
  limit: Scalars['Float']['input'];
  page: Scalars['Float']['input'];
};


export type QueryProductByIdArgs = {
  id: Scalars['Int']['input'];
  include?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


export type QueryProductCountArgs = {
  q?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProductListArgs = {
  include?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  q?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
  where?: InputMaybe<Scalars['String']['input']>;
};


export type QueryProfileByUserArgs = {
  username: Scalars['String']['input'];
};

export type RegisterInput = {
  avatar: Scalars['String']['input'];
  birthday: Scalars['String']['input'];
  coverImage: Scalars['String']['input'];
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  sex: Scalars['Boolean']['input'];
  username: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  categoryCreated?: Maybe<Category>;
  productCreated?: Maybe<Product>;
};

export type UpdatePostInput = {
  audience?: InputMaybe<Scalars['String']['input']>;
  content?: InputMaybe<Scalars['String']['input']>;
  images?: InputMaybe<Array<Scalars['String']['input']>>;
  uuid: Scalars['String']['input'];
};

export type UpdateUserInput = {
  avatar: Scalars['String']['input'];
  coverImage: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  avatar: Scalars['String']['output'];
  birthday: Scalars['String']['output'];
  coverImage: Scalars['String']['output'];
  createAt?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  id: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  role: Scalars['String']['output'];
  sex: Scalars['Boolean']['output'];
  statusEmail: Scalars['String']['output'];
  updateAt?: Maybe<Scalars['String']['output']>;
  username: Scalars['String']['output'];
  verified: Scalars['Boolean']['output'];
};

export type UserMutationResponse = {
  __typename?: 'UserMutationResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  requiresTwoFactor?: Maybe<Scalars['Boolean']['output']>;
  success: Scalars['Boolean']['output'];
  twoFactorToken?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type UserQueryResponse = {
  __typename?: 'UserQueryResponse';
  code: Scalars['Float']['output'];
  errors?: Maybe<Array<Maybe<FieldError>>>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  users?: Maybe<Array<Maybe<User>>>;
};
