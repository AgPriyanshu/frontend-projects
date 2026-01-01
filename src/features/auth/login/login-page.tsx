import {
  Box,
  Button,
  Card,
  Center,
  Field,
  Fieldset,
  Input,
  InputGroup,
  Stack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MdEmail, MdLock } from "react-icons/md";
import { loginSchema, type LoginFormData } from "./schema";

export const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("Form submitted:", data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // TODO: Implement actual login logic here
  };

  return (
    <Box w={"full"} h={"full"}>
      <Center h="full">
        <Card.Root
          border={"1px solid blackAplha.400"}
          borderRadius={"lg"}
          padding={"5"}
          mb={"10rem"}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset.Root size="lg" maxW="md">
              <Stack>
                <Fieldset.Legend>Welcome Back</Fieldset.Legend>
                <Fieldset.HelperText>
                  Enter your credentials to access the workspace
                </Fieldset.HelperText>
              </Stack>
              <Fieldset.Content>
                <Field.Root invalid={!!errors.email}>
                  <Field.Label>Email</Field.Label>
                  <InputGroup startElement={<MdEmail />}>
                    <Input
                      {...register("email")}
                      type="email"
                      size="sm"
                      placeholder="you@example.com"
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
                bg="brand.500"
                borderRadius={"lg"}
                loading={isSubmitting}
                width="full"
              >
                Sign In
              </Button>
            </Fieldset.Root>
          </form>
        </Card.Root>
      </Center>
    </Box>
  );
};
