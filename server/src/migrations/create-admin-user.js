"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcrypt = require("bcrypt");
var prisma = new client_1.PrismaClient();
function createAdminUser() {
    return __awaiter(this, void 0, void 0, function () {
        var adminDept, adminPosition, hashedPassword, adminUser, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, 10, 12]);
                    console.log('🔄 Starting admin user creation...');
                    return [4 /*yield*/, prisma.department.findFirst({
                            where: { name: 'Administration' }
                        })];
                case 1:
                    adminDept = _a.sent();
                    if (!!adminDept) return [3 /*break*/, 3];
                    return [4 /*yield*/, prisma.department.create({
                            data: {
                                name: 'Administration',
                                description: 'System Administration Department'
                            }
                        })];
                case 2:
                    adminDept = _a.sent();
                    _a.label = 3;
                case 3:
                    console.log('✅ Admin department created/verified');
                    return [4 /*yield*/, prisma.position.findFirst({
                            where: {
                                departmentId: adminDept.id,
                                name: 'System Administrator'
                            }
                        })];
                case 4:
                    adminPosition = _a.sent();
                    if (!!adminPosition) return [3 /*break*/, 6];
                    return [4 /*yield*/, prisma.position.create({
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
                        })];
                case 5:
                    adminPosition = _a.sent();
                    _a.label = 6;
                case 6:
                    console.log('✅ Admin position created/verified');
                    return [4 /*yield*/, bcrypt.hash('Admin@123', 10)];
                case 7:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'admin@gmail.com' },
                            update: {
                                password: hashedPassword,
                                accountStatus: client_1.UserAccountStatus.ACTIVE,
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
                                accountStatus: client_1.UserAccountStatus.ACTIVE,
                                departmentId: adminDept.id,
                                positionId: adminPosition.id,
                                canCreatePersonalProjects: true,
                                canCreatePersonalTasks: true,
                                personalProjectLimit: -1 // Unlimited
                            }
                        })];
                case 8:
                    adminUser = _a.sent();
                    console.log('✅ Admin user created/updated successfully');
                    console.log('🎉 Admin setup completed!');
                    console.log('Admin user email: admin@gmail.com');
                    console.log('Admin user password: Admin@123');
                    return [3 /*break*/, 12];
                case 9:
                    error_1 = _a.sent();
                    console.error('❌ Admin user creation failed:', error_1);
                    throw error_1;
                case 10: return [4 /*yield*/, prisma.$disconnect()];
                case 11:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 12: return [2 /*return*/];
            }
        });
    });
}
// Run migration if this file is executed directly
if (require.main === module) {
    createAdminUser()
        .then(function () {
        console.log('✨ Admin setup completed successfully!');
        process.exit(0);
    })
        .catch(function (error) {
        console.error('💥 Admin setup failed:', error);
        process.exit(1);
    });
}
