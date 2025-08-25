import type { PatientTherapyInterface } from "./IPatientTherapy";
import type { PsychologistInterface } from "./IPsychologist";
import type {CaseStatusInterface} from "./ICaseStatus"

export interface TherapyInterface {
  ID?: number;
  CaseTitle?: string;
  CaseDescription?: string;
  CaseStartDate?: string;
  CaseStatusID?: number;
  CaseStatus?: CaseStatusInterface

  PsychologistID?: number;
  Psychologist?: PsychologistInterface

  PatientID?: number;
  Patient?: PatientTherapyInterface

}
