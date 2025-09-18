import type { IEmotion } from "./IEmotion";

export interface ISubEmotion {
  ID?: number;
  ConfidencePercentage?: number;
  Score?: number;
  EmotionAnalysisResultsID?: number;
  EmotionsID?: number;

  emotions?: IEmotion;
}