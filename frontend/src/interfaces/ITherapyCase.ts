import type { PatientInterface } from "./IPatient";
import type { PsychologistInterface } from "./IPsychologist";
import type {CaseStatusInterface} from "./ICaseStatus"

export interface TherapyCaseInterface {
  ID?: number;
  CaseTitle?: string;
  CaseDescription?: string;
  CaseStartDate?: string;
  CaseStatusID?: number;
  CaseStatus?: CaseStatusInterface

  PsychologistID?: number;
  Psychologist?: PsychologistInterface

  PatientID?: number;
  Patient?: PatientInterface

}
