import * as fs from "node:fs/promises";
import * as path from "node:path";

const __filename = new URL("", import.meta.url).pathname;
// __dirname is only available in CommonJS modules
const __dirname = path.dirname(__filename);

export async function main() {
  const now = new Date();
  const prefix = now.toISOString().replace(/[^a-z0-9]/gi, "");
  const name = process.argv[2];
  if (!name || !name.match(/^[a-z0-9-]+$/)) {
    process.exitCode = 1;
    return console.error(
      "Must pass a migration name consisting of lowercase digits, numbers, and dashes."
    );
  }
  const filename = `${prefix}-${name}`;
  const dir = path.join(__dirname, "..", "server", "db", "migrations");

  await fs.writeFile(path.join(dir, `${filename}.ts`), template, { flag: "wx" });
}

const template = `import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>): Promise<void> {
  // Migration code
}

export async function down(db: Kysely<unknown>): Promise<void> {
  // Migration code
}
`;

main();
