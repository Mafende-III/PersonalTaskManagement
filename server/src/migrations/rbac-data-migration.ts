import { PrismaClient, UserAccountStatus, ProjectType, Visibility } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Data migration script for RBAC implementation
 * This script safely migrates existing data to support new RBAC features
 * while preserving all existing functionality
 */
export async function migrateExistingDataToRBAC() {
  console.log('🔄 Starting RBAC data migration...')

  try {
    // Step 1: Update existing users to ensure they have proper RBAC fields
    console.log('📝 Updating existing users with RBAC fields...')
    const updateUsersResult = await prisma.user.updateMany({
      where: {
        emailVerified: false // Target users who haven't been migrated yet
      },
      data: {
        accountStatus: UserAccountStatus.ACTIVE,
        emailVerified: true, // Assume existing users are verified
        verifiedAt: new Date(),
        canCreatePersonalProjects: true,
        canCreatePersonalTasks: true,
        personalProjectLimit: 10 // Give existing users higher limit
      }
    })
    console.log(`✅ Updated ${updateUsersResult.count} users to ACTIVE status`)

    // Step 2: Update existing projects to set type and visibility
    console.log('📝 Updating existing projects with RBAC fields...')
    const updateProjectsResult = await prisma.project.updateMany({
      where: {
        // All existing projects need RBAC fields, so update all
      },
      data: {
        type: ProjectType.TEAM, // Assume existing projects are team projects
        visibility: Visibility.PRIVATE
      }
    })
    console.log(`✅ Updated ${updateProjectsResult.count} projects with RBAC fields`)

    // Step 3: Set creatorId for existing projects (map userId to creatorId)
    console.log('📝 Setting creatorId for existing projects...')
    const projects = await prisma.project.findMany({
      where: {
        creatorId: null
      },
      select: {
        id: true,
        userId: true
      }
    })

    for (const project of projects) {
      await prisma.project.update({
        where: { id: project.id },
        data: { creatorId: project.userId }
      })
    }
    console.log(`✅ Set creatorId for ${projects.length} projects`)

    // Step 4: Set creatorId for existing tasks (map userId to creatorId)
    console.log('📝 Setting creatorId for existing tasks...')
    const tasks = await prisma.task.findMany({
      where: {
        creatorId: null
      },
      select: {
        id: true,
        userId: true
      }
    })

    for (const task of tasks) {
      await prisma.task.update({
        where: { id: task.id },
        data: { creatorId: task.userId }
      })
    }
    console.log(`✅ Set creatorId for ${tasks.length} tasks`)

    // Step 5: Create default department and position for existing users (optional)
    console.log('📝 Creating default department for unassigned users...')
    
    // Create a default department
    let defaultDepartment = await prisma.department.findFirst({
      where: { name: 'General' }
    })
    
    if (!defaultDepartment) {
      defaultDepartment = await prisma.department.create({
        data: {
          name: 'General',
          description: 'Default department for existing users'
        }
      })
    }

    // Create a default position with full permissions
    let defaultPosition = await prisma.position.findFirst({
      where: { 
        departmentId: defaultDepartment.id,
        level: 1
      }
    })
    
    if (!defaultPosition) {
      defaultPosition = await prisma.position.create({
        data: {
          name: 'Team Member',
          level: 1,
          departmentId: defaultDepartment.id,
          permissions: {
            project: {
              create: true,
              delete: 'own',
              edit: 'own',
              view: 'all',
              assignUsers: true
            },
            task: {
              create: 'any_project',
              delete: 'own',
              edit: 'own',
              createSubtask: 'own'
            },
            user: {
              invite: true,
              edit: false,
              viewDetails: 'all'
            },
            department: {
              manage: false,
              editHierarchy: false
            }
          }
        }
      })
    }

    // Optionally assign existing users to default department/position
    // (commented out to allow manual assignment)
    /*
    const unassignedUsers = await prisma.user.findMany({
      where: {
        departmentId: null
      }
    })

    for (const user of unassignedUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          departmentId: defaultDepartment.id,
          positionId: defaultPosition.id
        }
      })
    }
    console.log(`✅ Assigned ${unassignedUsers.length} users to default department`)
    */

    console.log('✅ RBAC data migration completed successfully!')
    console.log(`📊 Migration Summary:`)
    console.log(`   - Users updated: ${updateUsersResult.count}`)
    console.log(`   - Projects updated: ${updateProjectsResult.count}`)
    console.log(`   - Tasks updated: ${tasks.length}`)
    console.log(`   - Default department created: ${defaultDepartment.name}`)
    console.log(`   - Default position created: ${defaultPosition.name}`)

  } catch (error) {
    console.error('❌ RBAC data migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateExistingDataToRBAC()
    .then(() => {
      console.log('🎉 Migration completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error)
      process.exit(1)
    })
}