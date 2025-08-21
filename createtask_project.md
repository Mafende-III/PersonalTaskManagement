mafendemario@M-III-LP PersonalTaskManagement % npm run dev

> personal-task-management@1.0.0 dev
> npm run build:shared && concurrently "npm run dev:client" "npm run dev:server"


> personal-task-management@1.0.0 build:shared
> cd shared && npm run build


> task-management-shared@1.0.0 build
> tsc

[1] 
[1] > personal-task-management@1.0.0 dev:server
[1] > cd server && npm run dev
[1] 
[0] 
[0] > personal-task-management@1.0.0 dev:client
[0] > cd client && npm run dev
[0] 
[0] 
[0] > task-management-client@0.0.0 dev
[0] > vite
[0] 
[1] 
[1] > task-management-server@1.0.0 dev
[1] > nodemon src/server.ts
[1] 
[1] [nodemon] 3.1.10
[1] [nodemon] to restart at any time, enter `rs`
[1] [nodemon] watching path(s): src/**/*
[1] [nodemon] watching extensions: ts,js,json
[1] [nodemon] starting `ts-node src/server.ts src/server.ts`
[0] 
[0]   VITE v5.4.19  ready in 96 ms
[0] 
[0]   ➜  Local:   http://localhost:5173/
[0]   ➜  Network: use --host to expose
[1] 📊 Database connected successfully
[1] 🚀 Server is running on port 5001
[1] 📡 Health check: http://localhost:5001/health
[1] 🔗 API endpoint: http://localhost:5001/api/test
[1] 🔐 Auth endpoints: http://localhost:5001/api/auth
[1] 📋 Task endpoints: http://localhost:5001/api/tasks
[1] 📁 Project endpoints: http://localhost:5001/api/projects
[1] prisma:query SELECT 1
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email", "public"."users"."password", "public"."users"."name", "public"."users"."verified", "public"."users"."createdAt", "public"."users"."updatedAt" FROM "public"."users" WHERE ("public"."users"."email" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."projects"."id", "public"."projects"."name", "public"."projects"."description", "public"."projects"."color", "public"."projects"."status"::text, "public"."projects"."createdAt", "public"."projects"."updatedAt", "public"."projects"."userId", COALESCE("aggr_selection_0_Task"."_aggr_count_tasks", 0) AS "_aggr_count_tasks" FROM "public"."projects" LEFT JOIN (SELECT "public"."tasks"."projectId", COUNT(*) AS "_aggr_count_tasks" FROM "public"."tasks" WHERE 1=1 GROUP BY "public"."tasks"."projectId") AS "aggr_selection_0_Task" ON ("public"."projects"."id" = "aggr_selection_0_Task"."projectId") WHERE "public"."projects"."userId" = $1 ORDER BY "public"."projects"."createdAt" DESC OFFSET $2
[1] prisma:query SELECT 1
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."tasks"."id", "public"."tasks"."title", "public"."tasks"."description", "public"."tasks"."status"::text, "public"."tasks"."priority"::text, "public"."tasks"."dueDate", "public"."tasks"."completedAt", "public"."tasks"."position", "public"."tasks"."tags", "public"."tasks"."createdAt", "public"."tasks"."updatedAt", "public"."tasks"."userId", "public"."tasks"."projectId" FROM "public"."tasks" WHERE "public"."tasks"."userId" = $1 ORDER BY "public"."tasks"."position" DESC LIMIT $2 OFFSET $3
[1] prisma:query BEGIN
[1] prisma:query INSERT INTO "public"."tasks" ("id","title","description","status","priority","dueDate","position","tags","createdAt","updatedAt","userId","projectId") VALUES ($1,$2,$3,CAST($4::text AS "public"."TaskStatus"),CAST($5::text AS "public"."TaskPriority"),$6,$7,$8,$9,$10,$11,$12) RETURNING "public"."tasks"."id"
[1] prisma:query ROLLBACK
[1] prisma:error 
[1] Invalid `prisma.task.create()` invocation in
[1] /Users/mafendemario/Desktop/PersonalTaskManagement/server/src/controllers/task.ts:142:38
[1] 
[1]   139   orderBy: { position: 'desc' }
[1]   140 })
[1]   141 
[1] → 142 const task = await prisma.task.create(
[1] Foreign key constraint violated: `tasks_projectId_fkey (index)`
[1] Error creating task: PrismaClientKnownRequestError: 
[1] Invalid `prisma.task.create()` invocation in
[1] /Users/mafendemario/Desktop/PersonalTaskManagement/server/src/controllers/task.ts:142:38
[1] 
[1]   139   orderBy: { position: 'desc' }
[1]   140 })
[1]   141 
[1] → 142 const task = await prisma.task.create(
[1] Foreign key constraint violated: `tasks_projectId_fkey (index)`
[1]     at $n.handleRequestError (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:121:7315)
[1]     at $n.handleAndLogRequestError (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:121:6623)
[1]     at $n.request (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:121:6307)
[1]     at async l (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:130:9633)
[1]     at async createTask (/Users/mafendemario/Desktop/PersonalTaskManagement/server/src/controllers/task.ts:142:20) {
[1]   code: 'P2003',
[1]   clientVersion: '5.22.0',
[1]   meta: { modelName: 'Task', field_name: 'tasks_projectId_fkey (index)' }
[1] }
[1] prisma:query SELECT 1
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."tasks"."id", "public"."tasks"."title", "public"."tasks"."description", "public"."tasks"."status"::text, "public"."tasks"."priority"::text, "public"."tasks"."dueDate", "public"."tasks"."completedAt", "public"."tasks"."position", "public"."tasks"."tags", "public"."tasks"."createdAt", "public"."tasks"."updatedAt", "public"."tasks"."userId", "public"."tasks"."projectId" FROM "public"."tasks" WHERE "public"."tasks"."userId" = $1 ORDER BY "public"."tasks"."position" DESC LIMIT $2 OFFSET $3
[1] prisma:query BEGIN
[1] prisma:query INSERT INTO "public"."tasks" ("id","title","description","status","priority","dueDate","position","tags","createdAt","updatedAt","userId","projectId") VALUES ($1,$2,$3,CAST($4::text AS "public"."TaskStatus"),CAST($5::text AS "public"."TaskPriority"),$6,$7,$8,$9,$10,$11,$12) RETURNING "public"."tasks"."id"
[1] prisma:query ROLLBACK
[1] prisma:error 
[1] Invalid `prisma.task.create()` invocation in
[1] /Users/mafendemario/Desktop/PersonalTaskManagement/server/src/controllers/task.ts:142:38
[1] 
[1]   139   orderBy: { position: 'desc' }
[1]   140 })
[1]   141 
[1] → 142 const task = await prisma.task.create(
[1] Foreign key constraint violated: `tasks_projectId_fkey (index)`
[1] Error creating task: PrismaClientKnownRequestError: 
[1] Invalid `prisma.task.create()` invocation in
[1] /Users/mafendemario/Desktop/PersonalTaskManagement/server/src/controllers/task.ts:142:38
[1] 
[1]   139   orderBy: { position: 'desc' }
[1]   140 })
[1]   141 
[1] → 142 const task = await prisma.task.create(
[1] Foreign key constraint violated: `tasks_projectId_fkey (index)`
[1]     at $n.handleRequestError (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:121:7315)
[1]     at $n.handleAndLogRequestError (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:121:6623)
[1]     at $n.request (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:121:6307)
[1]     at async l (/Users/mafendemario/Desktop/PersonalTaskManagement/node_modules/@prisma/client/runtime/library.js:130:9633)
[1]     at async createTask (/Users/mafendemario/Desktop/PersonalTaskManagement/server/src/controllers/task.ts:142:20) {
[1]   code: 'P2003',
[1]   clientVersion: '5.22.0',
[1]   meta: { modelName: 'Task', field_name: 'tasks_projectId_fkey (index)' }
[1] }
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query BEGIN
[1] prisma:query INSERT INTO "public"."projects" ("id","name","description","color","status","createdAt","updatedAt","userId") VALUES ($1,$2,$3,$4,CAST($5::text AS "public"."ProjectStatus"),$6,$7,$8) RETURNING "public"."projects"."id"
[1] prisma:query SELECT "public"."projects"."id", "public"."projects"."name", "public"."projects"."description", "public"."projects"."color", "public"."projects"."status"::text, "public"."projects"."createdAt", "public"."projects"."updatedAt", "public"."projects"."userId", COALESCE("aggr_selection_0_Task"."_aggr_count_tasks", 0) AS "_aggr_count_tasks" FROM "public"."projects" LEFT JOIN (SELECT "public"."tasks"."projectId", COUNT(*) AS "_aggr_count_tasks" FROM "public"."tasks" WHERE 1=1 GROUP BY "public"."tasks"."projectId") AS "aggr_selection_0_Task" ON ("public"."projects"."id" = "aggr_selection_0_Task"."projectId") WHERE "public"."projects"."id" = $1 LIMIT $2 OFFSET $3
[1] prisma:query COMMIT
[1] prisma:query SELECT 1
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."projects"."id", "public"."projects"."name", "public"."projects"."description", "public"."projects"."color", "public"."projects"."status"::text, "public"."projects"."createdAt", "public"."projects"."updatedAt", "public"."projects"."userId", COALESCE("aggr_selection_0_Task"."_aggr_count_tasks", 0) AS "_aggr_count_tasks" FROM "public"."projects" LEFT JOIN (SELECT "public"."tasks"."projectId", COUNT(*) AS "_aggr_count_tasks" FROM "public"."tasks" WHERE 1=1 GROUP BY "public"."tasks"."projectId") AS "aggr_selection_0_Task" ON ("public"."projects"."id" = "aggr_selection_0_Task"."projectId") WHERE "public"."projects"."userId" = $1 ORDER BY "public"."projects"."createdAt" DESC OFFSET $2
[1] prisma:query SELECT 1
[1] prisma:query SELECT "public"."users"."id", "public"."users"."email" FROM "public"."users" WHERE ("public"."users"."id" = $1 AND 1=1) LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."projects"."id", "public"."projects"."name", "public"."projects"."description", "public"."projects"."color", "public"."projects"."status"::text, "public"."projects"."createdAt", "public"."projects"."updatedAt", "public"."projects"."userId" FROM "public"."projects" WHERE ("public"."projects"."id" = $1 AND "public"."projects"."userId" = $2) LIMIT $3 OFFSET $4
[1] prisma:query SELECT "public"."tasks"."id", "public"."tasks"."title", "public"."tasks"."description", "public"."tasks"."status"::text, "public"."tasks"."priority"::text, "public"."tasks"."dueDate", "public"."tasks"."completedAt", "public"."tasks"."position", "public"."tasks"."tags", "public"."tasks"."createdAt", "public"."tasks"."updatedAt", "public"."tasks"."userId", "public"."tasks"."projectId" FROM "public"."tasks" WHERE "public"."tasks"."userId" = $1 ORDER BY "public"."tasks"."position" DESC LIMIT $2 OFFSET $3
[1] prisma:query BEGIN
[1] prisma:query INSERT INTO "public"."tasks" ("id","title","description","status","priority","dueDate","position","tags","createdAt","updatedAt","userId","projectId") VALUES ($1,$2,$3,CAST($4::text AS "public"."TaskStatus"),CAST($5::text AS "public"."TaskPriority"),$6,$7,$8,$9,$10,$11,$12) RETURNING "public"."tasks"."id"
[1] prisma:query SELECT "public"."tasks"."id", "public"."tasks"."title", "public"."tasks"."description", "public"."tasks"."status"::text, "public"."tasks"."priority"::text, "public"."tasks"."dueDate", "public"."tasks"."completedAt", "public"."tasks"."position", "public"."tasks"."tags", "public"."tasks"."createdAt", "public"."tasks"."updatedAt", "public"."tasks"."userId", "public"."tasks"."projectId" FROM "public"."tasks" WHERE "public"."tasks"."id" = $1 LIMIT $2 OFFSET $3
[1] prisma:query SELECT "public"."projects"."id", "public"."projects"."name", "public"."projects"."color" FROM "public"."projects" WHERE "public"."projects"."id" IN ($1) OFFSET $2
[1] prisma:query COMMIT