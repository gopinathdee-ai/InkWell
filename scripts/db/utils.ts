import { createInterface } from "node:readline/promises";

// Blocks scripts that must never touch production data.
export function refuseInProduction(scriptName: string) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    console.error(`${scriptName} is disabled when NODE_ENV or VERCEL_ENV is "production".`);
    process.exit(1);
  }
}

// Asks the user to type an exact phrase before a destructive step runs.
export async function confirmPhrase(question: string, phrase: string) {
  if (!process.stdin.isTTY) {
    console.error("This command needs an interactive terminal to confirm.");
    process.exit(1);
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  // Bold red for the phrase the user must type (ESC[1;31m ... ESC[0m).
  const esc = String.fromCharCode(27);
  const highlighted = `${esc}[1;31m${phrase}${esc}[0m`;
  const answer = await rl.question(`${question}\nType ${highlighted} to continue: `);
  rl.close();
  if (answer.trim() !== phrase) {
    console.log("Confirmation did not match. Nothing was changed.");
    process.exit(1);
  }
}

export function fail(error: unknown): never {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
