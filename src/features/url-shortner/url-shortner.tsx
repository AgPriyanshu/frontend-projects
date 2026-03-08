import {
  Card,
  Center,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  Link,
} from "@chakra-ui/react";
import { useShortenURL } from "api/url-shortner";
import { useState } from "react";
import { LuSend } from "react-icons/lu";
export const URLShortner = () => {
  // States.
  const [value, setValue] = useState("");

  // APIs.
  const { mutate: shortenURL, data: shortenUrlResponse } = useShortenURL();

  // Handlers.
  const isInvalid = () => {
    if (value.trim() === "") {
      return false;
    }

    try {
      new URL(value);
      return false;
    } catch {
      return true;
    }
  };

  const onSubmit = (formSubmitEvent: React.FormEvent) => {
    formSubmitEvent.preventDefault();

    if (isInvalid()) {
      return;
    }

    shortenURL(
      { url: value },
      {
        onSuccess: (response) => {
          const { shortUrl } = response.data.data;
          navigator.clipboard.writeText(shortUrl);
        },
      }
    );
  };

  return (
    <Center className="url-shortner" border={"1px solid black"}>
      <Card.Root width="xl">
        <Card.Body gap="2" justifyContent={"center"} h={"full"}>
          <Card.Title textAlign={"center"} fontSize={"xx-large"}>
            URL Shortner
          </Card.Title>
          <Card.Description mt={"4"} mb={"4"} minH={"88px"}>
            <form onSubmit={onSubmit}>
              <Field.Root invalid={isInvalid()}>
                <Field.Label>Website URL</Field.Label>
                <HStack justifyContent={"space-evenly"} w={"full"}>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                  <IconButton type="submit">
                    <LuSend />
                  </IconButton>
                </HStack>
                <Field.ErrorText>Enter a valid URL</Field.ErrorText>
              </Field.Root>
            </form>
          </Card.Description>
          {shortenUrlResponse && (
            <Flex
              p={"4"}
              borderColor={"border"}
              borderWidth={"1px"}
              borderRadius={"md"}
              alignItems={"center"}
              flexDir={"column"}
            >
              <Link
                color="primary.success"
                href={shortenUrlResponse.data.data.shortUrl}
                variant={"underline"}
              >
                {shortenUrlResponse.data.data.shortUrl}
              </Link>
            </Flex>
          )}
        </Card.Body>
      </Card.Root>
    </Center>
  );
};
