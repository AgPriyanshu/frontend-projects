import {
  AbsoluteCenter,
  Box,
  Button,
  Card,
  Field,
  Fieldset,
  Input,
  InputGroup,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { toaster } from "design-system/toaster";
import { useForm } from "react-hook-form";
import { MdEmail, MdLock } from "react-icons/md";
import { useNavigate } from "react-router";
import { WorldOfAppsLogo } from "shared/components";
import { useLogin } from "src/api/auth";
import { loginSchema, type LoginFormData } from "./schema";

export const LoginPage = () => {
  // APIs.
  const { mutate: login } = useLogin();

  // Hooks.
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const navigate = useNavigate();

  // Handlers.
  const onSubmit = async (data: LoginFormData) => {
    login(
      { username: data.email, password: data.password },
      {
        onError: () => {
          toaster.create({
            description: "Invalid Credentials. Please try again",
            type: "error",
          });
        },
        onSuccess: () => {
          toaster.create({ description: "Login successfull", type: "success" });
          navigate("/");
        },
      }
    );
  };

  return (
    <Box w={"100vw"} h={"100vh"} position="relative">
      <WorldOfAppsLogo />
      <AbsoluteCenter>
        <Card.Root
          border={"1px solid blackAplha.400"}
          borderRadius={"lg"}
          padding={"5"}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset.Root size="lg" maxW="md">
              <VStack gap={"4"}>
                <Fieldset.Legend textAlign={"center"} fontSize={"xl"}>
                  Welcome Back
                </Fieldset.Legend>
                <Fieldset.HelperText>
                  Enter your credentials to access the workspace
                </Fieldset.HelperText>
              </VStack>
              <Fieldset.Content>
                <Field.Root invalid={!!errors.email}>
                  <Field.Label>Email</Field.Label>
                  <InputGroup startElement={<MdEmail />}>
                    <Input
                      {...register("email")}
                      type="email"
                      size="sm"
                      placeholder="Enter your email"
                    />
                  </InputGroup>
                  {errors.email && (
                    <Field.ErrorText>{errors.email.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label>Password</Field.Label>
                  <InputGroup startElement={<MdLock />}>
                    <Input
                      {...register("password")}
                      type="password"
                      size="sm"
                      placeholder="Enter your password"
                    />
                  </InputGroup>
                  {errors.password && (
                    <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                  )}
                </Field.Root>
              </Fieldset.Content>
              <Button
                type="submit"
                color="onPrimary"
                bg="primary"
                borderRadius={"lg"}
                loading={isSubmitting}
              >
                Sign In
              </Button>
            </Fieldset.Root>
          </form>
        </Card.Root>
      </AbsoluteCenter>
    </Box>
  );
};
