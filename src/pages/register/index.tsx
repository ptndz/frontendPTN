import { TextInput } from "../../components/ui/TextInput";
import Button from "../../components/ui/Button";
const index = () => {
  return (
    <div>
      <div className="w-full h-screen flex items-center justify-center">
        <div className="w-96 h-auto bg-white rounded-md shadow-md p-4">
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
            block="true"
            fontSize="text-xl"
            fontWeight="font-bold"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default index;
