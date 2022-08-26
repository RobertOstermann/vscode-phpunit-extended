export default interface TestResult {
  output?: string;
  message?: string;
  success?: boolean;
  skipped?: boolean;
  line?: number;
}
