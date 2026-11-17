/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
import { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
export type GetUsersYouMayKnowQueryVariables = Exact<{ [key: string]: never }>;

export type GetUsersYouMayKnowQuery = {
  getUsersYouMayKnow: {
    code: number;
    success: boolean;
    message: string | null;
    users: Array<{
      id: string;
      fullName: string;
      avatar: string;
      username: string;
    } | null> | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type FriendRequestQueryVariables = Exact<{ [key: string]: never }>;

export type FriendRequestQuery = {
  friendRequest: {
    code: number;
    success: boolean;
    message: string | null;
    users: Array<{
      id: string;
      fullName: string;
      avatar: string;
      username: string;
    } | null> | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type CommentCommentMutationVariables = Exact<{
  commentId: number;
  content: string;
}>;

export type CommentCommentMutation = {
  commentComment: {
    code: number;
    success: boolean;
    message: string | null;
    comment: {
      id: number;
      content: string;
      user: { id: string; username: string; fullName: string; avatar: string };
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          username: string;
          fullName: string;
          avatar: string;
        };
      } | null> | null;
    } | null;
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { logout: boolean };

export type LikeCommentMutationVariables = Exact<{
  commentId: number;
  typeReact: string;
}>;

export type LikeCommentMutation = {
  likeComment: {
    code: number;
    success: boolean;
    message: string | null;
    like: {
      id: number;
      reactions: string;
      user: { fullName: string; username: string };
    } | null;
  };
};

export type CommentPostMutationVariables = Exact<{
  postUuid: string;
  content: string;
}>;

export type CommentPostMutation = {
  commentPost: {
    code: number;
    success: boolean;
    message: string | null;
    comment: {
      id: number;
      content: string;
      user: { id: string; username: string; fullName: string; avatar: string };
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          username: string;
          fullName: string;
          avatar: string;
        };
      } | null> | null;
    } | null;
    comments: Array<{
      id: number;
      content: string;
      user: { id: string; username: string; fullName: string; avatar: string };
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          username: string;
          fullName: string;
          avatar: string;
        };
      } | null> | null;
    } | null> | null;
  };
};

export type LikePostMutationVariables = Exact<{
  postUuid: string;
  typeReact: string;
}>;

export type LikePostMutation = {
  likePost: {
    code: number;
    success: boolean;
    message: string | null;
    like: {
      id: number;
      reactions: string;
      user: { fullName: string; username: string };
    } | null;
  };
};

export type DeletePostMutationVariables = Exact<{
  uuid: string;
}>;

export type DeletePostMutation = {
  deletePost: {
    code: number;
    success: boolean;
    message: string | null;
    post: {
      uuid: string;
      content: string;
      createAt: string | null;
      updateAt: string | null;
      images: Array<string | null>;
    } | null;
    errors: Array<{ field: string; message: string } | null> | null;
  };
};

export type CreateBookmarkQueryVariables = Exact<{
  postUuid: string;
}>;

export type CreateBookmarkQuery = {
  createBookmark: {
    code: number;
    success: boolean;
    bookmarks: Array<{
      user: { username: string; fullName: string; avatar: string };
      post: {
        uuid: string;
        content: string;
        createAt: string | null;
        updateAt: string | null;
        shares: number;
        likesCount: number | null;
        commentsCount: number | null;
        images: Array<string | null> | null;
        user: { username: string; fullName: string };
        likes: Array<{ id: number; reactions: string } | null> | null;
        comments: Array<{
          id: number;
          content: string;
          likes: Array<{ id: number; reactions: string } | null> | null;
          user: {
            id: string;
            username: string;
            avatar: string;
            fullName: string;
          };
        } | null> | null;
      };
    } | null> | null;
  };
};

export type BookmarkAllQueryVariables = Exact<{ [key: string]: never }>;

export type BookmarkAllQuery = {
  bookmarkAll: {
    code: number;
    success: boolean;
    bookmarks: Array<{
      id: number;
      createAt: string | null;
      user: { id: string; username: string; fullName: string; avatar: string };
      post: {
        uuid: string;
        content: string;
        createAt: string | null;
        updateAt: string | null;
        shares: number;
        likesCount: number | null;
        commentsCount: number | null;
        images: Array<string | null> | null;
        user: {
          id: string;
          username: string;
          avatar: string;
          fullName: string;
        };
        likes: Array<{
          id: number;
          reactions: string;
          user: {
            id: string;
            username: string;
            avatar: string;
            fullName: string;
          };
        } | null> | null;
        comments: Array<{
          id: number;
          content: string;
          user: {
            id: string;
            username: string;
            avatar: string;
            fullName: string;
          };
        } | null> | null;
      };
    } | null> | null;
  };
};

export type PostsQueryVariables = Exact<{
  page: number;
  limit: number;
}>;

export type PostsQuery = {
  posts: {
    code: number;
    success: boolean;
    message: string | null;
    page: number | null;
    limit: number | null;
    posts: Array<{
      uuid: string;
      content: string;
      createAt: string | null;
      updateAt: string | null;
      shares: number;
      likesCount: number | null;
      commentsCount: number | null;
      images: Array<string | null> | null;
      user: {
        id: string;
        avatar: string;
        username: string;
        fullName: string;
        verified: boolean;
      };
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          avatar: string;
          username: string;
          fullName: string;
          verified: boolean;
        };
      } | null> | null;
      comments: Array<{
        id: number;
        content: string;
        user: {
          id: string;
          avatar: string;
          username: string;
          fullName: string;
          verified: boolean;
        };
        likes: Array<{
          id: number;
          reactions: string;
          user: {
            id: string;
            username: string;
            fullName: string;
            verified: boolean;
            avatar: string;
          };
        } | null> | null;
      } | null> | null;
    } | null> | null;
  };
};

export type PostQueryVariables = Exact<{
  uuid: string;
}>;

export type PostQuery = {
  post: {
    code: number;
    success: boolean;
    message: string | null;
    post: {
      uuid: string;
      content: string;
      createAt: string | null;
      updateAt: string | null;
      shares: number;
      likesCount: number | null;
      commentsCount: number | null;
      images: Array<string | null> | null;
      user: {
        id: string;
        avatar: string;
        username: string;
        fullName: string;
        verified: boolean;
      };
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          avatar: string;
          username: string;
          fullName: string;
          verified: boolean;
        };
      } | null> | null;
      comments: Array<{
        id: number;
        content: string;
        user: {
          id: string;
          avatar: string;
          username: string;
          fullName: string;
          verified: boolean;
        };
        likes: Array<{
          id: number;
          reactions: string;
          user: {
            id: string;
            username: string;
            fullName: string;
            verified: boolean;
            avatar: string;
          };
        } | null> | null;
      } | null> | null;
    } | null;
  } | null;
};

export type GetPostsUserByUserNameQueryVariables = Exact<{
  username: string;
  page: number;
  limit: number;
}>;

export type GetPostsUserByUserNameQuery = {
  getPostsUserByUserName: {
    code: number;
    success: boolean;
    message: string | null;
    page: number | null;
    limit: number | null;
    posts: Array<{
      uuid: string;
      content: string;
      createAt: string | null;
      updateAt: string | null;
      shares: number;
      likesCount: number | null;
      commentsCount: number | null;
      images: Array<string | null> | null;
      user: {
        id: string;
        avatar: string;
        username: string;
        fullName: string;
        verified: boolean;
      };
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          avatar: string;
          username: string;
          fullName: string;
          verified: boolean;
        };
      } | null> | null;
      comments: Array<{
        id: number;
        content: string;
        user: {
          id: string;
          avatar: string;
          username: string;
          fullName: string;
          verified: boolean;
        };
      } | null> | null;
    } | null> | null;
  } | null;
};

export type GetAllPostIdsQueryVariables = Exact<{ [key: string]: never }>;

export type GetAllPostIdsQuery = { getAllPostIds: Array<string | null> };

export type GetCommentCommentQueryVariables = Exact<{
  commentId: number;
}>;

export type GetCommentCommentQuery = {
  getCommentComment: {
    code: number;
    comments: Array<{
      id: number;
      content: string;
      likes: Array<{
        id: number;
        reactions: string;
        user: {
          id: string;
          username: string;
          avatar: string;
          fullName: string;
          verified: boolean;
        };
      } | null> | null;
      user: {
        id: string;
        username: string;
        avatar: string;
        fullName: string;
        verified: boolean;
      };
    } | null> | null;
  };
};

export type UserQueryVariables = Exact<{ [key: string]: never }>;

export type UserQuery = {
  user: {
    code: number;
    success: boolean;
    message: string | null;
    user: {
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
      statusEmail: string;
      verified: boolean;
      createAt: string | null;
      updateAt: string | null;
    } | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type GetUserQueryVariables = Exact<{
  username: string;
}>;

export type GetUserQuery = {
  getUser: {
    code: number;
    success: boolean;
    message: string | null;
    user: {
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
      statusEmail: string;
      verified: boolean;
      createAt: string | null;
      updateAt: string | null;
    } | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type GetUserByUuidQueryVariables = Exact<{
  userUuid: string;
}>;

export type GetUserByUuidQuery = {
  getUserByUuid: {
    code: number;
    success: boolean;
    message: string | null;
    user: {
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
      statusEmail: string;
      verified: boolean;
      createAt: string | null;
      updateAt: string | null;
    } | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;

export type LoginMutation = {
  login: {
    code: number;
    success: boolean;
    message: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    requiresTwoFactor: boolean | null;
    twoFactorToken: string | null;
    user: {
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
      statusEmail: string;
      verified: boolean;
      coverImage: string;
      createAt: string | null;
      updateAt: string | null;
    } | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type RegisterMutationVariables = Exact<{
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  fullName: string;
  phone: string;
  birthday: string;
  sex: boolean;
  avatar: string;
  coverImage: string;
}>;

export type RegisterMutation = {
  register: {
    code: number;
    success: boolean;
    message: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    user: {
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
      statusEmail: string;
      verified: boolean;
      coverImage: string;
      createAt: string | null;
      updateAt: string | null;
    } | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type ResetPasswordMutationVariables = Exact<{
  password: string;
  token: string;
}>;

export type ResetPasswordMutation = { resetPassword: boolean };

export type ForgotPasswordQueryVariables = Exact<{
  email: string;
}>;

export type ForgotPasswordQuery = { forgotPassword: boolean };

export type ProfileQueryVariables = Exact<{ [key: string]: never }>;

export type ProfileQuery = {
  profile: {
    profile: {
      id: number;
      city: string;
      education: string;
      relationship: string;
      from: string;
      workplace: string;
      updateAt: string | null;
    } | null;
  };
};

export type ProfileByUserQueryVariables = Exact<{
  username: string;
}>;

export type ProfileByUserQuery = {
  profileByUser: {
    profile: {
      id: number;
      city: string;
      education: string;
      relationship: string;
      from: string;
      workplace: string;
      updateAt: string | null;
    } | null;
  };
};

export type UpdateProfileMutationVariables = Exact<{
  city: string;
  education: string;
  relationship: string;
  from: string;
  workplace: string;
}>;

export type UpdateProfileMutation = {
  updateProfile: {
    code: number;
    success: boolean;
    message: string | null;
    errors: Array<{ message: string; field: string } | null> | null;
    profile: {
      id: number;
      city: string;
      education: string;
      relationship: string;
      from: string;
      workplace: string;
      updateAt: string | null;
    } | null;
  };
};

export type UpdateUserMutationVariables = Exact<{
  firstName: string;
  lastName: string;
  fullName: string;
  avatar: string;
  coverImage: string;
}>;

export type UpdateUserMutation = {
  updateUser: {
    code: number;
    success: boolean;
    message: string | null;
    accessToken: string | null;
    user: {
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
      createAt: string | null;
      updateAt: string | null;
      statusEmail: string;
      verified: boolean;
    } | null;
    errors: Array<{ message: string; field: string } | null> | null;
  };
};

export type ConfirmationQueryVariables = Exact<{
  token: string;
}>;

export type ConfirmationQuery = { confirmation: boolean };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<
    DocumentTypeDecoration<TResult, TVariables>["__apiType"]
  >;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const GetUsersYouMayKnowDocument = new TypedDocumentString(`
    query getUsersYouMayKnow {
  getUsersYouMayKnow {
    code
    success
    message
    users {
      id
      fullName
      avatar
      username
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<
  GetUsersYouMayKnowQuery,
  GetUsersYouMayKnowQueryVariables
>;
export const FriendRequestDocument = new TypedDocumentString(`
    query friendRequest {
  friendRequest {
    code
    success
    message
    users {
      id
      fullName
      avatar
      username
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<
  FriendRequestQuery,
  FriendRequestQueryVariables
>;
export const CommentCommentDocument = new TypedDocumentString(`
    mutation commentComment($commentId: Float!, $content: String!) {
  commentComment(commentId: $commentId, content: $content) {
    code
    success
    message
    comment {
      id
      user {
        id
        username
        fullName
        avatar
      }
      content
      likes {
        id
        reactions
        user {
          id
          username
          fullName
          avatar
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  CommentCommentMutation,
  CommentCommentMutationVariables
>;
export const LogoutDocument = new TypedDocumentString(`
    mutation logout {
  logout
}
    `) as unknown as TypedDocumentString<
  LogoutMutation,
  LogoutMutationVariables
>;
export const LikeCommentDocument = new TypedDocumentString(`
    mutation likeComment($commentId: Float!, $typeReact: String!) {
  likeComment(commentId: $commentId, typeReact: $typeReact) {
    code
    success
    message
    like {
      id
      reactions
      user {
        fullName
        username
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  LikeCommentMutation,
  LikeCommentMutationVariables
>;
export const CommentPostDocument = new TypedDocumentString(`
    mutation commentPost($postUuid: String!, $content: String!) {
  commentPost(postUuid: $postUuid, content: $content) {
    code
    success
    message
    comment {
      id
      user {
        id
        username
        fullName
        avatar
      }
      content
      likes {
        id
        reactions
        user {
          id
          username
          fullName
          avatar
        }
      }
    }
    comments {
      id
      content
      user {
        id
        username
        fullName
        avatar
      }
      likes {
        id
        user {
          id
          username
          fullName
          avatar
        }
        reactions
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  CommentPostMutation,
  CommentPostMutationVariables
>;
export const LikePostDocument = new TypedDocumentString(`
    mutation likePost($postUuid: String!, $typeReact: String!) {
  likePost(postUuid: $postUuid, typeReact: $typeReact) {
    code
    success
    message
    like {
      id
      reactions
      user {
        fullName
        username
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  LikePostMutation,
  LikePostMutationVariables
>;
export const DeletePostDocument = new TypedDocumentString(`
    mutation deletePost($uuid: String!) {
  deletePost(uuid: $uuid) {
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
    `) as unknown as TypedDocumentString<
  DeletePostMutation,
  DeletePostMutationVariables
>;
export const CreateBookmarkDocument = new TypedDocumentString(`
    query createBookmark($postUuid: String!) {
  createBookmark(postUuid: $postUuid) {
    code
    success
    bookmarks {
      user {
        username
        fullName
        avatar
      }
      post {
        uuid
        content
        createAt
        updateAt
        shares
        likesCount
        commentsCount
        images
        user {
          username
          fullName
        }
        likes {
          id
          reactions
        }
        comments {
          id
          content
          likes {
            id
            reactions
          }
          user {
            id
            username
            avatar
            fullName
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  CreateBookmarkQuery,
  CreateBookmarkQueryVariables
>;
export const BookmarkAllDocument = new TypedDocumentString(`
    query bookmarkAll {
  bookmarkAll {
    code
    success
    bookmarks {
      id
      createAt
      user {
        id
        username
        fullName
        avatar
      }
      post {
        uuid
        content
        createAt
        updateAt
        shares
        likesCount
        commentsCount
        images
        user {
          id
          username
          avatar
          fullName
        }
        likes {
          id
          reactions
          user {
            id
            username
            avatar
            fullName
          }
        }
        comments {
          id
          content
          user {
            id
            username
            avatar
            fullName
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  BookmarkAllQuery,
  BookmarkAllQueryVariables
>;
export const PostsDocument = new TypedDocumentString(`
    query posts($page: Float!, $limit: Float!) {
  posts(page: $page, limit: $limit) {
    code
    success
    message
    page
    limit
    posts {
      uuid
      content
      createAt
      updateAt
      shares
      likesCount
      commentsCount
      images
      user {
        id
        avatar
        username
        fullName
        verified
      }
      likes {
        id
        reactions
        user {
          id
          avatar
          username
          fullName
          verified
        }
      }
      comments {
        id
        content
        user {
          id
          avatar
          username
          fullName
          verified
        }
        likes {
          id
          user {
            id
            username
            fullName
            verified
            avatar
          }
          reactions
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostsQuery, PostsQueryVariables>;
export const PostDocument = new TypedDocumentString(`
    query post($uuid: String!) {
  post(uuid: $uuid) {
    code
    success
    message
    post {
      uuid
      content
      createAt
      updateAt
      shares
      likesCount
      commentsCount
      images
      user {
        id
        avatar
        username
        fullName
        verified
      }
      likes {
        id
        reactions
        user {
          id
          avatar
          username
          fullName
          verified
        }
      }
      comments {
        id
        content
        user {
          id
          avatar
          username
          fullName
          verified
        }
        likes {
          id
          user {
            id
            username
            fullName
            verified
            avatar
          }
          reactions
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<PostQuery, PostQueryVariables>;
export const GetPostsUserByUserNameDocument = new TypedDocumentString(`
    query getPostsUserByUserName($username: String!, $page: Float!, $limit: Float!) {
  getPostsUserByUserName(username: $username, page: $page, limit: $limit) {
    code
    success
    message
    page
    limit
    posts {
      uuid
      content
      createAt
      updateAt
      shares
      likesCount
      commentsCount
      images
      user {
        id
        avatar
        username
        fullName
        verified
      }
      likes {
        id
        reactions
        user {
          id
          avatar
          username
          fullName
          verified
        }
      }
      comments {
        id
        content
        user {
          id
          avatar
          username
          fullName
          verified
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  GetPostsUserByUserNameQuery,
  GetPostsUserByUserNameQueryVariables
>;
export const GetAllPostIdsDocument = new TypedDocumentString(`
    query getAllPostIds {
  getAllPostIds
}
    `) as unknown as TypedDocumentString<
  GetAllPostIdsQuery,
  GetAllPostIdsQueryVariables
>;
export const GetCommentCommentDocument = new TypedDocumentString(`
    query getCommentComment($commentId: Float!) {
  getCommentComment(commentId: $commentId) {
    code
    comments {
      id
      content
      likes {
        id
        reactions
        user {
          id
          username
          avatar
          fullName
          verified
        }
      }
      user {
        id
        username
        avatar
        fullName
        verified
      }
    }
  }
}
    `) as unknown as TypedDocumentString<
  GetCommentCommentQuery,
  GetCommentCommentQueryVariables
>;
export const UserDocument = new TypedDocumentString(`
    query user {
  user {
    code
    success
    message
    user {
      id
      fullName
      lastName
      firstName
      username
      email
      avatar
      coverImage
      phone
      birthday
      sex
      role
      statusEmail
      verified
      createAt
      updateAt
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<UserQuery, UserQueryVariables>;
export const GetUserDocument = new TypedDocumentString(`
    query getUser($username: String!) {
  getUser(username: $username) {
    code
    success
    message
    user {
      id
      fullName
      lastName
      firstName
      username
      email
      avatar
      coverImage
      phone
      birthday
      sex
      role
      statusEmail
      verified
      createAt
      updateAt
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<GetUserQuery, GetUserQueryVariables>;
export const GetUserByUuidDocument = new TypedDocumentString(`
    query getUserByUuid($userUuid: String!) {
  getUserByUuid(userUuid: $userUuid) {
    code
    success
    message
    user {
      id
      fullName
      lastName
      firstName
      username
      email
      avatar
      coverImage
      phone
      birthday
      sex
      role
      statusEmail
      verified
      createAt
      updateAt
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<
  GetUserByUuidQuery,
  GetUserByUuidQueryVariables
>;
export const LoginDocument = new TypedDocumentString(`
    mutation login($email: String!, $password: String!) {
  login(loginInput: {usernameOrEmail: $email, password: $password}) {
    code
    success
    message
    accessToken
    refreshToken
    requiresTwoFactor
    twoFactorToken
    user {
      id
      fullName
      lastName
      firstName
      username
      email
      avatar
      phone
      birthday
      sex
      role
      statusEmail
      verified
      coverImage
      createAt
      updateAt
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = new TypedDocumentString(`
    mutation register($firstName: String!, $lastName: String!, $email: String!, $password: String!, $username: String!, $fullName: String!, $phone: String!, $birthday: String!, $sex: Boolean!, $avatar: String!, $coverImage: String!) {
  register(
    registerInput: {firstName: $firstName, lastName: $lastName, email: $email, password: $password, username: $username, fullName: $fullName, phone: $phone, birthday: $birthday, sex: $sex, avatar: $avatar, coverImage: $coverImage}
  ) {
    code
    success
    message
    accessToken
    refreshToken
    user {
      id
      fullName
      lastName
      firstName
      username
      email
      avatar
      phone
      birthday
      sex
      role
      statusEmail
      verified
      coverImage
      createAt
      updateAt
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<
  RegisterMutation,
  RegisterMutationVariables
>;
export const ResetPasswordDocument = new TypedDocumentString(`
    mutation resetPassword($password: String!, $token: String!) {
  resetPassword(password: $password, token: $token)
}
    `) as unknown as TypedDocumentString<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const ForgotPasswordDocument = new TypedDocumentString(`
    query forgotPassword($email: String!) {
  forgotPassword(email: $email)
}
    `) as unknown as TypedDocumentString<
  ForgotPasswordQuery,
  ForgotPasswordQueryVariables
>;
export const ProfileDocument = new TypedDocumentString(`
    query profile {
  profile {
    profile {
      id
      city
      education
      relationship
      from
      workplace
      updateAt
    }
  }
}
    `) as unknown as TypedDocumentString<ProfileQuery, ProfileQueryVariables>;
export const ProfileByUserDocument = new TypedDocumentString(`
    query profileByUser($username: String!) {
  profileByUser(username: $username) {
    profile {
      id
      city
      education
      relationship
      from
      workplace
      updateAt
    }
  }
}
    `) as unknown as TypedDocumentString<
  ProfileByUserQuery,
  ProfileByUserQueryVariables
>;
export const UpdateProfileDocument = new TypedDocumentString(`
    mutation updateProfile($city: String!, $education: String!, $relationship: String!, $from: String!, $workplace: String!) {
  updateProfile(
    profileInput: {city: $city, education: $education, relationship: $relationship, from: $from, workplace: $workplace}
  ) {
    code
    success
    message
    errors {
      message
      field
    }
    profile {
      id
      city
      education
      relationship
      from
      workplace
      updateAt
    }
  }
}
    `) as unknown as TypedDocumentString<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const UpdateUserDocument = new TypedDocumentString(`
    mutation updateUser($firstName: String!, $lastName: String!, $fullName: String!, $avatar: String!, $coverImage: String!) {
  updateUser(
    updateUserInput: {firstName: $firstName, lastName: $lastName, avatar: $avatar, coverImage: $coverImage, fullName: $fullName}
  ) {
    code
    success
    message
    accessToken
    user {
      id
      fullName
      lastName
      firstName
      username
      email
      avatar
      phone
      birthday
      sex
      role
      coverImage
      createAt
      updateAt
      statusEmail
      verified
    }
    errors {
      message
      field
    }
  }
}
    `) as unknown as TypedDocumentString<
  UpdateUserMutation,
  UpdateUserMutationVariables
>;
export const ConfirmationDocument = new TypedDocumentString(`
    query confirmation($token: String!) {
  confirmation(token: $token)
}
    `) as unknown as TypedDocumentString<
  ConfirmationQuery,
  ConfirmationQueryVariables
>;

// NOTE (W6): client-preset v7 no longer emits schema types (User, IUser,
// IComment, IPost, ...). They live in ./schema-types.ts (generated by the
// `typescript` plugin — see codegen.ts). This re-export must be re-added
// after any `graphql-codegen` run that regenerates this file; the
// afterAllFileWrite hook in codegen.ts does it automatically.
export * from "./schema-types";
