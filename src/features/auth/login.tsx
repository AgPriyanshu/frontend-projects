import { useLoginRequest } from "@/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "@tanstack/react-router";
import { isUndefined } from "lodash";
import { useEffect } from "react";

export const Login = () => {
  // Hooks.
  const navigate = useNavigate();

  // Api.
  const {
    data: loginResponse,
    mutate: sendLoginRequest,
    isSuccess: isSuccessLoginRequest,
  } = useLoginRequest();

  // useEffects.
  useEffect(() => {
    if (isSuccessLoginRequest && !isUndefined(loginResponse)) {
      localStorage.setItem("token", loginResponse.data.token);
      navigate({ to: "/" });
    }
  }, [isSuccessLoginRequest, loginResponse]);

  // Handlers.
  const onSubmitHandler = (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const email = event.target["email"]?.value;
    const password = event.target["password"].value;

    if (!isUndefined(email) && !isUndefined(password)) {
      sendLoginRequest({ username: email, password });
    }
  };

  return (
    <Card className="w-full max-w-sm flex-center">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Login</CardTitle>
      </CardHeader>
      <form className="flex flex-col gap-6" onSubmit={onSubmitHandler}>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full cursor-pointer">
            Login
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
