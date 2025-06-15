export interface Prediction {
  device: string;
  confidence: number;
}

export interface APIResponse {
  data: {
    predicted_class: string;
    confidence: number;
    all_predictions: Array<{
      class: string;
      confidence: number;
      rank: number;
    }>;
    success: boolean;
    error: string | null;
  };
}
