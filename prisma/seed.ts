import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

// Khởi tạo adapter kết nối PostgreSQL theo chuẩn Prisma 7
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter }); // Truyền adapter vào đây

async function main() {
  // 1. Tạo các Quyền chức năng (Permissions)
  const deleteUserPerm = await prisma.permission.upsert({
    where: { name: 'DELETE_USER' },
    update: {},
    create: { name: 'DELETE_USER', description: 'Quyền xóa người dùng' },
  });

  const viewAllUsersPerm = await prisma.permission.upsert({
    where: { name: 'VIEW_ALL_USERS' },
    update: {},
    create: { name: 'VIEW_ALL_USERS', description: 'Quyền xem danh sách toàn bộ người dùng' },
  });

  // 2. Tạo các Vai trò (Roles)
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'Quản trị viên tối cao' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER', description: 'Người dùng thông thường' },
  });

  // 3. Gán quyền vào Vai trò cho ADMIN
  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: deleteUserPerm.id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: deleteUserPerm.id },
  });

  await prisma.rolePermission.upsert({
    where: { roleId_permissionId: { roleId: adminRole.id, permissionId: viewAllUsersPerm.id } },
    update: {},
    create: { roleId: adminRole.id, permissionId: viewAllUsersPerm.id },
  });

  // 4. Tạo một tài khoản Admin mẫu và gán roleId trực tiếp
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@tourplan.com' },
    update: {},
    create: {
      email: 'admin@tourplan.com',
      password: hashedPassword,
      displayName: 'Super Admin',
      provider: 'email',
      roleId: adminRole.id, 
    },
  });

  console.log('🌱 Seed dữ liệu phân quyền thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });