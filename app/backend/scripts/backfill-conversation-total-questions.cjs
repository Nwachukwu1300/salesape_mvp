const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.conversationSession.updateMany({
    data: { totalQuestions: 6 },
  });
  console.log(
    `Updated conversation sessions: ${result.count} set totalQuestions=6`,
  );
}

main()
  .catch((err) => {
    console.error("Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
