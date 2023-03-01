import Link from "next/link";
import { TextInput } from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
const index = () => {
  return (
    <div>
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-96 h-auto bg-white rounded-md shadow-md p-4">
          <div>
            <TextInput
              inputsize="large"
              type="text"
              placeholder="Email address or phone number"
              name="emailOrPhone"
            />
            <TextInput
              inputsize="large"
              name="password"
              type="password"
              placeholder="Password"
            />
            <Button
              type="submit"
              size="large"
              fontSize="text-xl"
              fontWeight="font-bold"
            >
              Login
            </Button>
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
                fontSize="text-xl"
              >
                Create New Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
