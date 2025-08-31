import type { FeedbackDiaryInterface } from "./IFeedbackDiary";

export interface DiaryInterface {
  ID?: number;
  CreatedAt?: string;
  DeletedAt?: string;
  Title?: string;
  Content?: string;
  UpdatedAt?: string;
  TagColors?: string;
  Confirmed?: boolean;
  TherapyCaseID?: number;

  FeedbackDiary?: FeedbackDiaryInterface[];
}
