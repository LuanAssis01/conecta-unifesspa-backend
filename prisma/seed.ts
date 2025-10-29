import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "admin@system.com";
    const adminPassword = "admin123";

    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await prisma.user.create({
            data: {
                name: "Admin",
                email: adminEmail,
                password: hashedPassword,
                role: UserRole.ADMIN,
            },
        });

        console.log("Admin criado com sucesso!");
    } else {
        console.log("Admin já existe!");
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });