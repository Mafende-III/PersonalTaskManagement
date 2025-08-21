import { PrismaClient, UserAccountStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🔄 Starting admin user creation...');

    // Create Admin Department if it doesn't exist
    let adminDept = await prisma.department.findFirst({
      where: { name: 'Administration' }
    });

    if (!adminDept) {
      adminDept = await prisma.department.create({
        data: {
          name: 'Administration',
          description: 'System Administration Department'
        }
      });
    }
    console.log('✅ Admin department created/verified');

    // Create Admin Position with full permissions
    let adminPosition = await prisma.position.findFirst({
      where: {
        departmentId: adminDept.id,
        name: 'System Administrator'
      }
    });

    if (!adminPosition) {
      adminPosition = await prisma.position.create({
        data: {
          name: 'System Administrator',
          level: 1, // Highest level
          departmentId: adminDept.id,
          permissions: {
            project: {
              create: true,
              delete: 'all',
              edit: 'all',
              view: 'all',
              assignUsers: true
            },
            task: {
              create: 'any_project',
              delete: 'all',
              edit: 'all',
              createSubtask: 'all'
            },
            user: {
              invite: true,
              edit: 'all',
              viewDetails: 'all'
            },
            department: {
              manage: true,
              editHierarchy: true
            }
          }
        }
      });
    }
    console.log('✅ Admin position created/verified');

    // Hash the admin password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    // Create Admin User
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@gmail.com' },
      update: {
        password: hashedPassword,
        accountStatus: UserAccountStatus.ACTIVE,
        verified: true,
        departmentId: adminDept.id,
        positionId: adminPosition.id,
        canCreatePersonalProjects: true,
        canCreatePersonalTasks: true,
        personalProjectLimit: -1 // Unlimited
      },
      create: {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'System Administrator',
        verified: true,
        accountStatus: UserAccountStatus.ACTIVE,
        departmentId: adminDept.id,
        positionId: adminPosition.id,
        canCreatePersonalProjects: true,
        canCreatePersonalTasks: true,
        personalProjectLimit: -1 // Unlimited
      }
    });
    console.log('✅ Admin user created/updated successfully');

    console.log('🎉 Admin setup completed!');
    console.log('Admin user email: admin@gmail.com');
    console.log('Admin user password: Admin@123');

  } catch (error) {
    console.error('❌ Admin user creation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✨ Admin setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Admin setup failed:', error);
      process.exit(1);
    });
} 