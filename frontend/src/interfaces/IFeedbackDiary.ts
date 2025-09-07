import type { DiaryInterface } from "./IDiary";
import type { FeedBackInterface } from "./IFeedback";

export interface FeedbackDiaryInterface {
  ID?: number;
  DiaryID?: number;
  Diary?: DiaryInterface;
  FeedbackID?: number;
  Feedbacks?: FeedBackInterface;
}