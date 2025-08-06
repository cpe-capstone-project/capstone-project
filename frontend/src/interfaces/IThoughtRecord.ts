export interface ThoughtRecordInterface {
  ID?: number;
  CreatedAt?: string;
  DeletedAt?: string;
  Situation?: string;
  Thoughts?: string;
  Behaviors?: string;
  TagColors?: string; // ✅ ใช้สีจาก backend
  AlternateThought?: string;
  UpdatedAt?: string;
  TherapyCaseID?: number;
  EmotionsID?: number;
}
