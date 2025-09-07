import type { PatientTherapyInterface } from "./IPatientTherapy";
import type { PsychologistInterface } from "./IPsychologist";
import type { FeedbackTimeInterface } from "./IFeedbackTime";
import type { FeedbackTypeInterface } from "./IFeedbackType";
import type { ThoughtRecordInterface } from "./IThoughtRecord";

export interface FeedBackInterface {
    ID?: number;
    FeedbackTitle?: string;
    FeedbackContent?: string;

    ThoughtRecordID?: number; // สำหรับเชื่อมกับ ThoughtRecord
    ThoughtRecord?: ThoughtRecordInterface;      // สามารถใส่ interface ของ ThoughtRecord ได้

    PsychologistID?: number;
    Psychologist?: PsychologistInterface;

    PatientID?: number;
    Patient?: PatientTherapyInterface;

    FeedbackTypeID?: number;
    FeedbackType?: FeedbackTypeInterface;

    FeedbackTimeID?: number;
    FeedbackTime?: FeedbackTimeInterface;

    CreatedAt?: string;

    // สำหรับส่ง Diary หลายตัว
    DiaryIDs?: number[];
}
