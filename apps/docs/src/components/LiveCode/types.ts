export interface ErrorState {
  hasError: boolean;
  errorName: string;
  errorMessage: string;
  stack: string;
  line: number | null;
  column: number | null;
  timestamp: number;
}
