import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Cpu, Shield, Zap } from "lucide-react";
import { useState } from "react";
import DropZone from "./drop-zone";
import ImagePreview from "./image-preview";
import PredictionResults from "./prediction-results";
import type { Prediction } from "./types";
import { deviceClassifierApi } from "@/api";

function GadgetClassifier() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string>("");

  const classifyImage = async (file: File): Promise<Prediction[]> => {
    const formData = new FormData();
    formData.append("device", file);

    try {
      const response = await deviceClassifierApi.classifyImage(file);

      return response.data.all_predictions.map((pred) => ({
        device: pred.class,
        confidence: pred.confidence,
      }));
    } catch (err) {
      console.error("Classification error:", err);
      throw new Error(
        err instanceof Error ? err.message : "Failed to classify image"
      );
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setError("");
    setUploadedImage(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Simulate upload delay (keeping for UX)
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUploading(false);

    // Start analysis
    setIsAnalyzing(true);

    try {
      const apiPredictions = await classifyImage(file);
      setPredictions(apiPredictions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to classify image");
      setPredictions([]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setUploadedImage(null);
    setImageUrl("");
    setPredictions([]);
    setError("");
  };

  const handleStartOver = () => {
    handleRemoveImage();
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Device Classifier</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload an image and let our AI identify whether it's a smartphone,
            smartwatch, tablet, camera, or laptop
          </p>
        </div>

        {/* Features */}
        {!uploadedImage && (
          <div className="mb-8">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground text-sm">
                    Get results in seconds with our optimized AI model
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Secure & Private
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Your images are processed securely and never stored
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mx-auto mb-4">
                    <Cpu className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">High Accuracy</h3>
                  <p className="text-muted-foreground text-sm">
                    Trained on thousands of device images for precision
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1">
          {!uploadedImage ? (
            <DropZone
              onImageUpload={handleImageUpload}
              isUploading={isUploading}
            />
          ) : (
            <div className="space-y-8">
              {/* Image Preview */}
              <div className="text-center">
                <ImagePreview
                  imageUrl={imageUrl}
                  fileName={uploadedImage.name}
                  onRemove={handleRemoveImage}
                />
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="text-red-700 text-center">
                      <p className="font-semibold">Classification Error</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results */}
              {(isAnalyzing || predictions.length > 0) && !error && (
                <PredictionResults
                  predictions={predictions}
                  isLoading={isAnalyzing}
                />
              )}

              {/* Action Buttons */}
              {(predictions.length > 0 || error) && (
                <div className="text-center">
                  <Button onClick={handleStartOver} size="lg">
                    Classify Another Image
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GadgetClassifier;
