import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, Cpu, Shield, Zap } from "lucide-react";
import { useState } from "react";
import DropZone from "./drop-zone";
import ImagePreview from "./image-preview";
import PredictionResults from "./prediction-results";

interface Prediction {
  device: string;
  confidence: number;
}

function GadgetClassifier() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateMockPredictions = (): Prediction[] => {
    const devices = ["smartphone", "smartwatch", "tablet", "camera", "laptop"];
    const randomIndex = Math.floor(Math.random() * devices.length);
    const topDevice = devices[randomIndex];

    // Generate realistic confidence scores
    const predictions: Prediction[] = devices.map((device) => {
      let confidence: number;
      if (device === topDevice) {
        confidence = 0.75 + Math.random() * 0.24; // 75-99%
      } else {
        confidence = Math.random() * 0.25; // 0-25%
      }
      return { device, confidence };
    });

    // Sort by confidence (highest first)
    return predictions.sort((a, b) => b.confidence - a.confidence);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedImage(file);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setImageUrl(url);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsUploading(false);

    // Start analysis
    setIsAnalyzing(true);

    // Simulate ML model prediction delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockPredictions = generateMockPredictions();
    setPredictions(mockPredictions);
    setIsAnalyzing(false);
  };

  const handleRemoveImage = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setUploadedImage(null);
    setImageUrl("");
    setPredictions([]);
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

              {/* Results */}
              {(isAnalyzing || predictions.length > 0) && (
                <PredictionResults
                  predictions={predictions}
                  isLoading={isAnalyzing}
                />
              )}

              {/* Action Buttons */}
              {predictions.length > 0 && (
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
