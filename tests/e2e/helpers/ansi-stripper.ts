import stripAnsiLib from "strip-ansi";

export function stripAnsi(input: string): string {
  return stripAnsiLib(input);
}
