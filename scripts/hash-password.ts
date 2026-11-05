// Usage: npm run hash-password -- "your password"
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error('Usage: npm run hash-password -- "your password"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log("\nFor .env.local (dollar signs must be escaped, Next.js expands them):");
console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}`);
console.log("\nFor Vercel environment variables (paste as is):");
console.log(hash + "\n");
