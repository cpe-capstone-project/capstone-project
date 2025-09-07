import type { EmotionsInterface } from "./IEmotions";
import type { SituationTagInterface } from "./ISituationTag";
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

  TherapyCaseID?: number | null;
  Emotions?: EmotionsInterface[];
  SituationTagID?: number;
  SituationTag?: SituationTagInterface;
}


