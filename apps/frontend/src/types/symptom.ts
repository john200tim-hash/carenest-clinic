export interface Symptom {
  id: string;
  description: string;
  severity: 'mild' | 'moderate' | 'severe';
  dateReported: Date;
}