import type { EmotionsInterface } from "./IEmotions";

export interface ThoughtRecordInterface {
  ID?: number;
  CreatedAt?: string;
  DeletedAt?: string;
  Situation?: string;
  Thoughts?: string;
  Behaviors?: string;
  TagColors?: string; 
  AlternateThought?: string;
  UpdatedAt?: string;
  TherapyCaseID?: number;
  Emotions?: EmotionsInterface[]; // ✅ เปลี่ยนจาก singular เป็น array
}
