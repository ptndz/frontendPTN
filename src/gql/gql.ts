/* eslint-disable */
import * as types from "./graphql";
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core";

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "\n    query getUsersYouMayKnow {\n      getUsersYouMayKnow {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  ":
    types.GetUsersYouMayKnowDocument,
  "\n    query friendRequest {\n      friendRequest {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  ":
    types.FriendRequestDocument,
  "\n    mutation createPost($content: String!, $images: [String!]!) {\n      createPost(createPostInput: { content: $content, images: $images }) {\n        code\n        success\n        message\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          images\n        }\n        errors {\n          field\n          message\n        }\n      }\n    }\n  ":
    types.CreatePostDocument,
  "\n        mutation logout {\n          logout\n        }\n      ":
    types.LogoutDocument,
  "\n    query getUsers {\n      getUsers {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  ":
    types.GetUsersDocument,
  "\n      mutation commentPost($postUuid: String!, $content: String!) {\n        commentPost(postUuid: $postUuid, content: $content) {\n          code\n          success\n          message\n          comment {\n            id\n            user {\n              id\n              username\n              fullName\n              avatar\n            }\n            content\n            likes {\n              id\n              reactions\n              user {\n                id\n                username\n                fullName\n                avatar\n              }\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              id\n              username\n              fullName\n              avatar\n            }\n            likes {\n              id\n              user {\n                id\n                username\n                fullName\n                avatar\n              }\n              reactions\n            }\n          }\n        }\n      }\n    ":
    types.CommentPostDocument,
  "\n      mutation likePost($postUuid: String!, $typeReact: String!) {\n        likePost(postUuid: $postUuid, typeReact: $typeReact) {\n          code\n          success\n          message\n          like {\n            id\n            reactions\n            user {\n              fullName\n              username\n            }\n          }\n        }\n      }\n    ":
    types.LikePostDocument,
  "\n      mutation deletePost($uuid: String!) {\n        deletePost(uuid: $uuid) {\n          code\n          success\n          message\n          post {\n            uuid\n            content\n            createAt\n            updateAt\n            images\n          }\n          errors {\n            field\n            message\n          }\n        }\n      }\n    ":
    types.DeletePostDocument,
  "\n        query createBookmark($postUuid: String!) {\n          createBookmark(postUuid: $postUuid) {\n            code\n            success\n            bookmarks {\n              user {\n                username\n                fullName\n                avatar\n              }\n              post {\n                uuid\n                content\n                createAt\n                updateAt\n                shares\n                images\n                user {\n                  username\n                  fullName\n                }\n                likes {\n                  id\n                  reactions\n                }\n                comments {\n                  id\n                  content\n                }\n              }\n            }\n          }\n        }\n      ":
    types.CreateBookmarkDocument,
  "\n  query bookmarkAll {\n    bookmarkAll {\n      code\n      success\n      bookmarks {\n        id\n        createAt\n        user {\n          id\n          username\n          fullName\n          avatar\n        }\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          shares\n          images\n          user {\n            id\n            username\n            avatar\n            fullName\n          }\n          likes {\n            id\n            reactions\n            user {\n              id\n              username\n              avatar\n              fullName\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              id\n              username\n              avatar\n              fullName\n            }\n          }\n        }\n      }\n    }\n  }\n":
    types.BookmarkAllDocument,
  "\n  query posts($page: Float!, $limit: Float!) {\n    posts(page: $page, limit: $limit) {\n      code\n      success\n      message\n      page\n      limit\n      posts {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n":
    types.PostsDocument,
  "\n  query post($uuid: String!) {\n    post(uuid: $uuid) {\n      code\n      success\n      message\n      post {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n":
    types.PostDocument,
  "\n  query getPostsUserByUserName(\n    $username: String!\n    $page: Float!\n    $limit: Float!\n  ) {\n    getPostsUserByUserName(username: $username, page: $page, limit: $limit) {\n      code\n      success\n      message\n      page\n      limit\n      posts {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n":
    types.GetPostsUserByUserNameDocument,
  "\n  query getAllPostIds {\n    getAllPostIds\n  }\n":
    types.GetAllPostIdsDocument,
  "\n  query user {\n    user {\n      code\n      success\n      message\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        coverImage\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n":
    types.UserDocument,
  "\n  query getUser($username: String!) {\n    getUser(username: $username) {\n      code\n      success\n      message\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        coverImage\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n":
    types.GetUserDocument,
  "\n  mutation login($email: String!, $password: String!) {\n    login(loginInput: { usernameOrEmail: $email, password: $password }) {\n      code\n      success\n      message\n      accessToken\n      refreshToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        coverImage\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n":
    types.LoginDocument,
  "\n  mutation register(\n    $firstName: String!\n    $lastName: String!\n    $email: String!\n    $password: String!\n    $username: String!\n    $fullName: String!\n    $phone: String!\n    $birthday: String!\n    $sex: Boolean!\n    $avatar: String!\n    $coverImage: String!\n  ) {\n    register(\n      registerInput: {\n        firstName: $firstName\n        lastName: $lastName\n        email: $email\n        password: $password\n        username: $username\n        fullName: $fullName\n        phone: $phone\n        birthday: $birthday\n        sex: $sex\n        avatar: $avatar\n        coverImage: $coverImage\n      }\n    ) {\n      code\n      success\n      message\n      accessToken\n      refreshToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        coverImage\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n":
    types.RegisterDocument,
  "\n  mutation resetPassword($password: String!, $token: String!) {\n    resetPassword(password: $password, token: $token)\n  }\n":
    types.ResetPasswordDocument,
  "\n  query forgotPassword($email: String!) {\n    forgotPassword(email: $email)\n  }\n":
    types.ForgotPasswordDocument,
  "\n  query profile {\n    profile {\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n":
    types.ProfileDocument,
  "\n  query profileByUser($username: String!) {\n    profileByUser(username: $username) {\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n":
    types.ProfileByUserDocument,
  "\n  mutation updateProfile(\n    $city: String!\n    $education: String!\n    $relationship: String!\n    $from: String!\n    $workplace: String!\n  ) {\n    updateProfile(\n      profileInput: {\n        city: $city\n        education: $education\n        relationship: $relationship\n        from: $from\n        workplace: $workplace\n      }\n    ) {\n      code\n      success\n      message\n      errors {\n        message\n        field\n      }\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n":
    types.UpdateProfileDocument,
  "\n  mutation updateUser(\n    $firstName: String!\n    $lastName: String!\n    $fullName: String!\n    $avatar: String!\n    $coverImage: String!\n  ) {\n    updateUser(\n      updateUserInput: {\n        firstName: $firstName\n        lastName: $lastName\n        avatar: $avatar\n        coverImage: $coverImage\n        fullName: $fullName\n      }\n    ) {\n      code\n      success\n      message\n      accessToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        coverImage\n        createAt\n        updateAt\n        statusEmail\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n":
    types.UpdateUserDocument,
  "\n        query confirmation($token: String!) {\n          confirmation(token: $token)\n        }\n      ":
    types.ConfirmationDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query getUsersYouMayKnow {\n      getUsersYouMayKnow {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "
): (typeof documents)["\n    query getUsersYouMayKnow {\n      getUsersYouMayKnow {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query friendRequest {\n      friendRequest {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "
): (typeof documents)["\n    query friendRequest {\n      friendRequest {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    mutation createPost($content: String!, $images: [String!]!) {\n      createPost(createPostInput: { content: $content, images: $images }) {\n        code\n        success\n        message\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          images\n        }\n        errors {\n          field\n          message\n        }\n      }\n    }\n  "
): (typeof documents)["\n    mutation createPost($content: String!, $images: [String!]!) {\n      createPost(createPostInput: { content: $content, images: $images }) {\n        code\n        success\n        message\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          images\n        }\n        errors {\n          field\n          message\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n        mutation logout {\n          logout\n        }\n      "
): (typeof documents)["\n        mutation logout {\n          logout\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n    query getUsers {\n      getUsers {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "
): (typeof documents)["\n    query getUsers {\n      getUsers {\n        code\n        success\n        message\n        users {\n          id\n          fullName\n          avatar\n          username\n        }\n        errors {\n          message\n          field\n        }\n      }\n    }\n  "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n      mutation commentPost($postUuid: String!, $content: String!) {\n        commentPost(postUuid: $postUuid, content: $content) {\n          code\n          success\n          message\n          comment {\n            id\n            user {\n              id\n              username\n              fullName\n              avatar\n            }\n            content\n            likes {\n              id\n              reactions\n              user {\n                id\n                username\n                fullName\n                avatar\n              }\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              id\n              username\n              fullName\n              avatar\n            }\n            likes {\n              id\n              user {\n                id\n                username\n                fullName\n                avatar\n              }\n              reactions\n            }\n          }\n        }\n      }\n    "
): (typeof documents)["\n      mutation commentPost($postUuid: String!, $content: String!) {\n        commentPost(postUuid: $postUuid, content: $content) {\n          code\n          success\n          message\n          comment {\n            id\n            user {\n              id\n              username\n              fullName\n              avatar\n            }\n            content\n            likes {\n              id\n              reactions\n              user {\n                id\n                username\n                fullName\n                avatar\n              }\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              id\n              username\n              fullName\n              avatar\n            }\n            likes {\n              id\n              user {\n                id\n                username\n                fullName\n                avatar\n              }\n              reactions\n            }\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n      mutation likePost($postUuid: String!, $typeReact: String!) {\n        likePost(postUuid: $postUuid, typeReact: $typeReact) {\n          code\n          success\n          message\n          like {\n            id\n            reactions\n            user {\n              fullName\n              username\n            }\n          }\n        }\n      }\n    "
): (typeof documents)["\n      mutation likePost($postUuid: String!, $typeReact: String!) {\n        likePost(postUuid: $postUuid, typeReact: $typeReact) {\n          code\n          success\n          message\n          like {\n            id\n            reactions\n            user {\n              fullName\n              username\n            }\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n      mutation deletePost($uuid: String!) {\n        deletePost(uuid: $uuid) {\n          code\n          success\n          message\n          post {\n            uuid\n            content\n            createAt\n            updateAt\n            images\n          }\n          errors {\n            field\n            message\n          }\n        }\n      }\n    "
): (typeof documents)["\n      mutation deletePost($uuid: String!) {\n        deletePost(uuid: $uuid) {\n          code\n          success\n          message\n          post {\n            uuid\n            content\n            createAt\n            updateAt\n            images\n          }\n          errors {\n            field\n            message\n          }\n        }\n      }\n    "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n        query createBookmark($postUuid: String!) {\n          createBookmark(postUuid: $postUuid) {\n            code\n            success\n            bookmarks {\n              user {\n                username\n                fullName\n                avatar\n              }\n              post {\n                uuid\n                content\n                createAt\n                updateAt\n                shares\n                images\n                user {\n                  username\n                  fullName\n                }\n                likes {\n                  id\n                  reactions\n                }\n                comments {\n                  id\n                  content\n                }\n              }\n            }\n          }\n        }\n      "
): (typeof documents)["\n        query createBookmark($postUuid: String!) {\n          createBookmark(postUuid: $postUuid) {\n            code\n            success\n            bookmarks {\n              user {\n                username\n                fullName\n                avatar\n              }\n              post {\n                uuid\n                content\n                createAt\n                updateAt\n                shares\n                images\n                user {\n                  username\n                  fullName\n                }\n                likes {\n                  id\n                  reactions\n                }\n                comments {\n                  id\n                  content\n                }\n              }\n            }\n          }\n        }\n      "];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query bookmarkAll {\n    bookmarkAll {\n      code\n      success\n      bookmarks {\n        id\n        createAt\n        user {\n          id\n          username\n          fullName\n          avatar\n        }\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          shares\n          images\n          user {\n            id\n            username\n            avatar\n            fullName\n          }\n          likes {\n            id\n            reactions\n            user {\n              id\n              username\n              avatar\n              fullName\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              id\n              username\n              avatar\n              fullName\n            }\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query bookmarkAll {\n    bookmarkAll {\n      code\n      success\n      bookmarks {\n        id\n        createAt\n        user {\n          id\n          username\n          fullName\n          avatar\n        }\n        post {\n          uuid\n          content\n          createAt\n          updateAt\n          shares\n          images\n          user {\n            id\n            username\n            avatar\n            fullName\n          }\n          likes {\n            id\n            reactions\n            user {\n              id\n              username\n              avatar\n              fullName\n            }\n          }\n          comments {\n            id\n            content\n            user {\n              id\n              username\n              avatar\n              fullName\n            }\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query posts($page: Float!, $limit: Float!) {\n    posts(page: $page, limit: $limit) {\n      code\n      success\n      message\n      page\n      limit\n      posts {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query posts($page: Float!, $limit: Float!) {\n    posts(page: $page, limit: $limit) {\n      code\n      success\n      message\n      page\n      limit\n      posts {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query post($uuid: String!) {\n    post(uuid: $uuid) {\n      code\n      success\n      message\n      post {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query post($uuid: String!) {\n    post(uuid: $uuid) {\n      code\n      success\n      message\n      post {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getPostsUserByUserName(\n    $username: String!\n    $page: Float!\n    $limit: Float!\n  ) {\n    getPostsUserByUserName(username: $username, page: $page, limit: $limit) {\n      code\n      success\n      message\n      page\n      limit\n      posts {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n"
): (typeof documents)["\n  query getPostsUserByUserName(\n    $username: String!\n    $page: Float!\n    $limit: Float!\n  ) {\n    getPostsUserByUserName(username: $username, page: $page, limit: $limit) {\n      code\n      success\n      message\n      page\n      limit\n      posts {\n        uuid\n        content\n        createAt\n        updateAt\n        shares\n        images\n        user {\n          id\n          avatar\n          username\n          fullName\n        }\n        likes {\n          id\n          reactions\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n        comments {\n          id\n          content\n          user {\n            id\n            avatar\n            username\n            fullName\n          }\n        }\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getAllPostIds {\n    getAllPostIds\n  }\n"
): (typeof documents)["\n  query getAllPostIds {\n    getAllPostIds\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query user {\n    user {\n      code\n      success\n      message\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        coverImage\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"
): (typeof documents)["\n  query user {\n    user {\n      code\n      success\n      message\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        coverImage\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query getUser($username: String!) {\n    getUser(username: $username) {\n      code\n      success\n      message\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        coverImage\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"
): (typeof documents)["\n  query getUser($username: String!) {\n    getUser(username: $username) {\n      code\n      success\n      message\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        coverImage\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation login($email: String!, $password: String!) {\n    login(loginInput: { usernameOrEmail: $email, password: $password }) {\n      code\n      success\n      message\n      accessToken\n      refreshToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        coverImage\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation login($email: String!, $password: String!) {\n    login(loginInput: { usernameOrEmail: $email, password: $password }) {\n      code\n      success\n      message\n      accessToken\n      refreshToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        coverImage\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation register(\n    $firstName: String!\n    $lastName: String!\n    $email: String!\n    $password: String!\n    $username: String!\n    $fullName: String!\n    $phone: String!\n    $birthday: String!\n    $sex: Boolean!\n    $avatar: String!\n    $coverImage: String!\n  ) {\n    register(\n      registerInput: {\n        firstName: $firstName\n        lastName: $lastName\n        email: $email\n        password: $password\n        username: $username\n        fullName: $fullName\n        phone: $phone\n        birthday: $birthday\n        sex: $sex\n        avatar: $avatar\n        coverImage: $coverImage\n      }\n    ) {\n      code\n      success\n      message\n      accessToken\n      refreshToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        coverImage\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation register(\n    $firstName: String!\n    $lastName: String!\n    $email: String!\n    $password: String!\n    $username: String!\n    $fullName: String!\n    $phone: String!\n    $birthday: String!\n    $sex: Boolean!\n    $avatar: String!\n    $coverImage: String!\n  ) {\n    register(\n      registerInput: {\n        firstName: $firstName\n        lastName: $lastName\n        email: $email\n        password: $password\n        username: $username\n        fullName: $fullName\n        phone: $phone\n        birthday: $birthday\n        sex: $sex\n        avatar: $avatar\n        coverImage: $coverImage\n      }\n    ) {\n      code\n      success\n      message\n      accessToken\n      refreshToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        statusEmail\n        coverImage\n        createAt\n        updateAt\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation resetPassword($password: String!, $token: String!) {\n    resetPassword(password: $password, token: $token)\n  }\n"
): (typeof documents)["\n  mutation resetPassword($password: String!, $token: String!) {\n    resetPassword(password: $password, token: $token)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query forgotPassword($email: String!) {\n    forgotPassword(email: $email)\n  }\n"
): (typeof documents)["\n  query forgotPassword($email: String!) {\n    forgotPassword(email: $email)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query profile {\n    profile {\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n"
): (typeof documents)["\n  query profile {\n    profile {\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  query profileByUser($username: String!) {\n    profileByUser(username: $username) {\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n"
): (typeof documents)["\n  query profileByUser($username: String!) {\n    profileByUser(username: $username) {\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateProfile(\n    $city: String!\n    $education: String!\n    $relationship: String!\n    $from: String!\n    $workplace: String!\n  ) {\n    updateProfile(\n      profileInput: {\n        city: $city\n        education: $education\n        relationship: $relationship\n        from: $from\n        workplace: $workplace\n      }\n    ) {\n      code\n      success\n      message\n      errors {\n        message\n        field\n      }\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation updateProfile(\n    $city: String!\n    $education: String!\n    $relationship: String!\n    $from: String!\n    $workplace: String!\n  ) {\n    updateProfile(\n      profileInput: {\n        city: $city\n        education: $education\n        relationship: $relationship\n        from: $from\n        workplace: $workplace\n      }\n    ) {\n      code\n      success\n      message\n      errors {\n        message\n        field\n      }\n      profile {\n        id\n        city\n        education\n        relationship\n        from\n        workplace\n        updateAt\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n  mutation updateUser(\n    $firstName: String!\n    $lastName: String!\n    $fullName: String!\n    $avatar: String!\n    $coverImage: String!\n  ) {\n    updateUser(\n      updateUserInput: {\n        firstName: $firstName\n        lastName: $lastName\n        avatar: $avatar\n        coverImage: $coverImage\n        fullName: $fullName\n      }\n    ) {\n      code\n      success\n      message\n      accessToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        coverImage\n        createAt\n        updateAt\n        statusEmail\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"
): (typeof documents)["\n  mutation updateUser(\n    $firstName: String!\n    $lastName: String!\n    $fullName: String!\n    $avatar: String!\n    $coverImage: String!\n  ) {\n    updateUser(\n      updateUserInput: {\n        firstName: $firstName\n        lastName: $lastName\n        avatar: $avatar\n        coverImage: $coverImage\n        fullName: $fullName\n      }\n    ) {\n      code\n      success\n      message\n      accessToken\n      user {\n        id\n        fullName\n        lastName\n        firstName\n        username\n        email\n        avatar\n        phone\n        birthday\n        sex\n        role\n        coverImage\n        createAt\n        updateAt\n        statusEmail\n      }\n      errors {\n        message\n        field\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "\n        query confirmation($token: String!) {\n          confirmation(token: $token)\n        }\n      "
): (typeof documents)["\n        query confirmation($token: String!) {\n          confirmation(token: $token)\n        }\n      "];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never;
