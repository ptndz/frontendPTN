import Link from "next/link";
import { TextInput } from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import HideComponents from "../../components/ui/HideComponents";
import { useEffect, useState } from "react";
import Loading from "../../components/ui/Loading";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";
import { useRouter } from "next/router";
import { checkAuth } from "../../plugins/auth.plugin";
const query = graphql(`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      code
      success
      message
      user {
        id
        username
        firstName
        email
        lastName
        email
        createAt
        username
      }
      errors {
        message
        field
      }
    }
  }
`);

const Index = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter();
  useEffect(() => {
    const isLogin = checkAuth();

    if (!isLogin) {
      router.push("/");
    }
  });
  const onClickButtonLogin = async () => {
    setLoading(true);
    const data = await graphQLClient.request(query, {
      loginInput: {
        usernameOrEmail: username,
        password: password,
      },
    });
    if (data.login.code !== 200) {
      if (data.login.errors) {
        setError(data.login.errors[0].message);
      }
      setTimeout(function () {
        setLoading(false);
      }, 1000);
      return;
    }
    router.push("/");
    return;
  };
  return (
    <div>
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-96 h-auto bg-white rounded-md shadow-md p-4">
          <div>
            {error ? (
              <div className="bg-red-600 text-white p-3 rounded shadow-lg pt-3">
                <p className="font-bold">Loi:</p>
                <p>{error}</p>
              </div>
            ) : undefined}
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                type="text"
                placeholder="Email address or phone number"
                name="emailOrPhone"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                name="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </HideComponents>
            <Loading isShow={loading}>
              <div className="mt-5 text-center">
                <Button
                  onClick={onClickButtonLogin}
                  type="submit"
                  size="large"
                  fontSize="text-xl"
                  fontWeight="font-bold">
                  Login
                </Button>
              </div>
            </Loading>
          </div>

          <div className="mt-2 text-center pb-3 border-b border-gray-300">
            <p className="text-primary cursor-pointer underline">
              Forgot password?
            </p>
          </div>
          <div className="mt-5 text-center">
            <Link href="/register">
              <Button
                size="large"
                block="true"
                bg="bg-greenLight"
                fontSize="text-xl">
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
