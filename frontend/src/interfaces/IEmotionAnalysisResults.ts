export interface IEmotionAnalysisResults {
  ID?: number;
  InputText?: string;
  TranslatedText?: string;
  AnalysisTimestamp?: string;
  Modelversion?: string;
  PrimaryEmotion?: string;
  DiaryID?: number;
  ThoughtRecordID?: number;
}