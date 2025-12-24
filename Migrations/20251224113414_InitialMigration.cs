using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentWebsite.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Accounts",
                columns: table => new
                {
                    ACC_Index = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ACC_UserId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ACC_Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ACC_Role = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Accounts", x => x.ACC_Index);
                });

            migrationBuilder.CreateTable(
                name: "Organizers",
                columns: table => new
                {
                    ORG_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ORG_FName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    ORG_MiddleI = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    ORG_LName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    ORG_Organization = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizers", x => x.ORG_Id);
                });

            migrationBuilder.CreateTable(
                name: "Students",
                columns: table => new
                {
                    STUD_StudentId = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    STUD_FName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    STUD_MiddleI = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    STUD_LName = table.Column<string>(type: "nvarchar(25)", maxLength: 25, nullable: false),
                    STUD_YearLevel = table.Column<int>(type: "int", nullable: false),
                    STUD_Course = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: false),
                    ACC_Index = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Students", x => x.STUD_StudentId);
                    table.ForeignKey(
                        name: "FK_Students_Accounts_ACC_Index",
                        column: x => x.ACC_Index,
                        principalTable: "Accounts",
                        principalColumn: "ACC_Index",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    ACT_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ACT_Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ACT_Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ACT_DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ACT_ScheduledDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ACT_IsGranted = table.Column<bool>(type: "bit", nullable: false),
                    STUD_StudentId = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    ORG_Id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.ACT_Id);
                    table.ForeignKey(
                        name: "FK_Activities_Organizers_ORG_Id",
                        column: x => x.ORG_Id,
                        principalTable: "Organizers",
                        principalColumn: "ORG_Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Activities_Students_STUD_StudentId",
                        column: x => x.STUD_StudentId,
                        principalTable: "Students",
                        principalColumn: "STUD_StudentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Lockers",
                columns: table => new
                {
                    LOCK_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LOCK_Spot = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LOCK_IsAvailable = table.Column<bool>(type: "bit", nullable: false),
                    LOCK_DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    STUD_StudentId = table.Column<string>(type: "nvarchar(20)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Lockers", x => x.LOCK_Id);
                    table.ForeignKey(
                        name: "FK_Lockers_Students_STUD_StudentId",
                        column: x => x.STUD_StudentId,
                        principalTable: "Students",
                        principalColumn: "STUD_StudentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Parkings",
                columns: table => new
                {
                    PARK_Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    STUD_StudentId = table.Column<string>(type: "nvarchar(20)", nullable: false),
                    PARK_Spot = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    PARK_VehicleType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PARK_VehicleModel = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    PARK_Schedule = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    PARK_DateCreated = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PARK_IsAvailable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Parkings", x => x.PARK_Id);
                    table.ForeignKey(
                        name: "FK_Parkings_Students_STUD_StudentId",
                        column: x => x.STUD_StudentId,
                        principalTable: "Students",
                        principalColumn: "STUD_StudentId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ORG_Id",
                table: "Activities",
                column: "ORG_Id");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_STUD_StudentId",
                table: "Activities",
                column: "STUD_StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Lockers_STUD_StudentId",
                table: "Lockers",
                column: "STUD_StudentId");

            migrationBuilder.CreateIndex(
                name: "IX_Parkings_STUD_StudentId",
                table: "Parkings",
                column: "STUD_StudentId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Students_ACC_Index",
                table: "Students",
                column: "ACC_Index");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "Lockers");

            migrationBuilder.DropTable(
                name: "Parkings");

            migrationBuilder.DropTable(
                name: "Organizers");

            migrationBuilder.DropTable(
                name: "Students");

            migrationBuilder.DropTable(
                name: "Accounts");
        }
    }
}
