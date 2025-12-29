import {
  Button as ChakraButton,
  type ButtonProps as ChakraButtonProps,
} from "@chakra-ui/react";

type ButtonProps = ChakraButtonProps;

export const Button: React.FC<ButtonProps> = ({ children }) => {
  return <ChakraButton className="fp-btn">{children}</ChakraButton>;
};
