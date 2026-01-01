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
import { MdEmail, MdLock } from "react-icons/md";

export const LoginPage = () => {
  console.log("login page rendered");
  return (
    <Box w={"full"} h={"full"}>
      <Center h="full">
        <Card.Root
          border={"1px solid blackAplha.400"}
          borderRadius={"lg"}
          padding={"5"}
          mb={"10rem"}
        >
          <Fieldset.Root size="lg" maxW="md">
            <Stack>
              <Fieldset.Legend>Welcome Back</Fieldset.Legend>
              <Fieldset.HelperText>
                Enter your credentials to access the workspace
              </Fieldset.HelperText>
            </Stack>
            <Fieldset.Content>
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <InputGroup startElement={<MdEmail />}>
                  <Input name="email" type="email" size="sm" />
                </InputGroup>
              </Field.Root>

              <Field.Root>
                <Field.Label>Password</Field.Label>
                <InputGroup startElement={<MdLock />}>
                  <Input name="password" type="password" size="sm" />
                </InputGroup>
              </Field.Root>
            </Fieldset.Content>
            <Button type="submit" bg="brand.500" borderRadius={"lg"}>
              Sign In
            </Button>
          </Fieldset.Root>
        </Card.Root>
      </Center>
    </Box>
  );
};
