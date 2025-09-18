import type { IEmotionAnalysisResults } from "./IEmotionAnalysisResults";
import type { FeedbackDiaryInterface } from "./IFeedbackDiary";
import type { TherapyInterface } from "./ITherapy";

export interface DiaryInterface {
  ID?: number;
  CreatedAt?: string;
  DeletedAt?: string;
  Title?: string;
  Content?: string;
  UpdatedAt?: string;
  
  TagColor1?: string;
  TagColor2?: string;
  TagColor3?: string;

  Confirmed?: boolean;
  
  TherapyCaseID?: number;
  TherapyCase?: TherapyInterface

  FeedbackDiary?: FeedbackDiaryInterface[];

  EmotionAnalysisResults?: IEmotionAnalysisResults[];
}