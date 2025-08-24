import type { DiaryInterface } from "./IDiary";

export interface DiarySummaryInterface {
  ID?: number;
  TherapyCaseID?: number;
  Timeframe?: string;
  StartDate?: string;
  EndDate?: string;
  SummaryText?: string;
  Keyword?: string;

  Diaries?: DiaryInterface[];
}
