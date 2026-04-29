import {
  Box,
  Button,
  Card,
  Field,
  Fieldset,
  Heading,
  Input,
  InputGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MdEmail, MdLock } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useLogin } from "src/api/auth";
import { toaster } from "design-system/toaster";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

export const DeadStockLoginPage = () => {
  const { mutate: login, isPending } = useLogin();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    login(
      { username: data.email, password: data.password },
      {
        onError: () => {
          toaster.create({
            description: "Invalid credentials. Please try again.",
            type: "error",
          });
        },
        onSuccess: () => {
          navigate("/dead-stock/owner/inventory", { replace: true });
        },
      }
    );
  };

  return (
    <Box
      className="dead-stock-login-page"
      minH="100dvh"
      w="100vw"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bg="bg.canvas"
      px={4}
      py={8}
    >
      <VStack gap={8} w="full" maxW="sm">
        {/* Brand */}
        <VStack gap={1} textAlign="center">
          <Heading size="2xl" fontWeight="bold" letterSpacing="tight">
            Dead Stock
          </Heading>
          <Text color="fg.muted" fontSize="sm">
            Shop owner portal
          </Text>
        </VStack>

        {/* Login card */}
        <Card.Root
          w="full"
          borderWidth="1px"
          borderColor="border.default"
          shadow="md"
        >
          <Card.Body p={6}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Fieldset.Root>
                <VStack gap={5} align="stretch">
                  <VStack gap={1} align="stretch">
                    <Heading size="md">Welcome back</Heading>
                    <Text fontSize="sm" color="fg.muted">
                      Sign in to manage your shop inventory.
                    </Text>
                  </VStack>

                  <Field.Root invalid={!!errors.email}>
                    <Field.Label>Email</Field.Label>
                    <InputGroup startElement={<MdEmail />}>
                      <Input
                        {...register("email")}
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
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
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </InputGroup>
                    {errors.password && (
                      <Field.ErrorText>
                        {errors.password.message}
                      </Field.ErrorText>
                    )}
                  </Field.Root>

                  <Button type="submit" loading={isPending} w="full">
                    Sign in
                  </Button>
                </VStack>
              </Fieldset.Root>
            </form>
          </Card.Body>
        </Card.Root>

        {/* Back to search */}
        <Button asChild variant="ghost" size="sm" color="fg.muted">
          <Link to="/dead-stock">
            <FiArrowLeft /> Back to search
          </Link>
        </Button>
      </VStack>
    </Box>
  );
};
