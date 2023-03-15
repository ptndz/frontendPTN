import React, { useEffect, useState } from "react";
import { TextInput } from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
import { IUser } from "../../types/user";
import { graphQLClient } from "../../plugins/graphql.plugin";
import { graphql } from "../../gql";
import Loading from "../../components/ui/Loading";
import HideComponents from "../../components/ui/HideComponents";
import { useRouter } from "next/router";
import { checkAuth } from "../../plugins/auth.plugin";

const query = graphql(`
  mutation Register($registerUser: RegisterInput!) {
    register(registerInput: $registerUser) {
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
const RegisterPage: React.FC = () => {
  const [user, setUser] = useState<IUser>({
    fullName: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    avatar: "https://random.imagecdn.app/200/200",
    phone: "",
    birthday: "",
    sex: false,
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isAcceptTerms, setIsAcceptTerms] = useState<boolean>(true);
  const router = useRouter();
  useEffect(() => {
    const isLogin = checkAuth();

    if (!isLogin) {
      router.push("/");
    }
  });
  const onChangeForm = (name: string, value: string | boolean) => {
    setUser({
      ...user,
      [name]: value,
    });
  };
  const postFormRegister = async () => {
    setLoading(true);
    setUser({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
    });

    const data = await graphQLClient.request(query, {
      registerUser: {
        ...user,
      },
    });

    if (data.register.code !== 200) {
      if (data.register.errors) {
        setError(data.register.errors[0].message);
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              return false;
            }}>
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
                placeholder="First Name"
                value={user?.firstName}
                onChange={(e) => onChangeForm("firstName", e.target.value)}
                required
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                type="text"
                placeholder="Last Name"
                value={user?.lastName}
                onChange={(e) => onChangeForm("lastName", e.target.value)}
                required
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                type="email"
                placeholder="Email address"
                value={user.email}
                onChange={(e) => onChangeForm("email", e.target.value)}
                required
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                name="phone"
                pattern="[0-9]{4}[0-9]{3}[0-9]{3}"
                placeholder="Phone"
                value={user.phone}
                onChange={(e) => onChangeForm("phone", e.target.value)}
                required
              />
            </HideComponents>

            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                type="text"
                placeholder="Username"
                value={user.username}
                onChange={(e) => onChangeForm("username", e.target.value)}
                required
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                type="password"
                placeholder="Password"
                value={user.password}
                onChange={(e) => onChangeForm("password", e.target.value)}
                required
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <TextInput
                inputsize="large"
                type="date"
                placeholder="birthday"
                min="1990-01-01"
                max="2100-12-31"
                value={user.birthday}
                onChange={(e) => onChangeForm("birthday", e.target.value)}
                required
              />
            </HideComponents>
            <HideComponents isHide={loading}>
              <div className="my-3 pt-3 flex items-start">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      className="w-8 h-8"
                      checked={user.sex}
                      onChange={(e) => onChangeForm("sex", e.target.checked)}
                    />
                  </div>
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Mark male gender
                  </label>
                </div>
              </div>
              <div className="my-3 pt-3 flex items-start">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={isAcceptTerms}
                      onChange={(e) => setIsAcceptTerms(e.target.checked)}
                      className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800"
                      required
                    />
                  </div>
                  <label className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Accept terms
                  </label>
                </div>
              </div>
            </HideComponents>

            <div className="pt-3">
              <Loading isShow={loading}>
                <Button
                  disabled={true}
                  onClick={postFormRegister}
                  size="large"
                  block="true"
                  fontSize="text-xl"
                  fontWeight="font-bold">
                  Register
                </Button>
              </Loading>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
