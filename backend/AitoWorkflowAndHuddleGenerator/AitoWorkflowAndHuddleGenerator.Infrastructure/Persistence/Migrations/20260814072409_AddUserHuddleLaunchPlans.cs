using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserHuddleLaunchPlans : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "UserHuddleLaunchPlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TeamName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CohortName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    SponsorName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Managers = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Facilitators = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    ProgramLead = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TaskStateJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHuddleLaunchPlans", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddleLaunchPlans_OwnerObjectId",
                table: "UserHuddleLaunchPlans",
                column: "OwnerObjectId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "UserHuddleLaunchPlans");
        }
    }
}
