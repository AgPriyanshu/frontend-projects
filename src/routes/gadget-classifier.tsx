import { createFileRoute } from "@tanstack/react-router";
import GadgetClassifier from "@/features/device-classifier/device-classifier";

export const Route = createFileRoute("/gadget-classifier")({
  component: () => <GadgetClassifier />,
});
