import type { FeedbackDiaryInterface } from "./IFeedbackDiary";

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

  FeedbackDiary?: FeedbackDiaryInterface[];
}
