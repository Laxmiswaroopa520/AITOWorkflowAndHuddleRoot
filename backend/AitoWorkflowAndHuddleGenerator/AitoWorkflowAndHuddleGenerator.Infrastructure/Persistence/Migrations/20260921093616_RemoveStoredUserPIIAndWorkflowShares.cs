using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveStoredUserPIIAndWorkflowShares : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WorkflowShares");

            migrationBuilder.DropColumn(
                name: "OwnerDisplayName",
                table: "UserWorkflows");

            migrationBuilder.DropColumn(
                name: "OwnerEmail",
                table: "UserWorkflows");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "OwnerDisplayName",
                table: "UserWorkflows",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "OwnerEmail",
                table: "UserWorkflows",
                type: "nvarchar(320)",
                maxLength: 320,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "WorkflowShares",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserWorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RecipientDisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RecipientEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    RecipientObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RevokedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    SharedByDisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SharedByEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    SharedByObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WorkflowShares_UserWorkflows_UserWorkflowId",
                        column: x => x.UserWorkflowId,
                        principalTable: "UserWorkflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowShares_RecipientObjectId",
                table: "WorkflowShares",
                column: "RecipientObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowShares_UserWorkflowId",
                table: "WorkflowShares",
                column: "UserWorkflowId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowShares_UserWorkflowId_RecipientObjectId",
                table: "WorkflowShares",
                columns: new[] { "UserWorkflowId", "RecipientObjectId" },
                unique: true,
                filter: "[IsRevoked] = 0");
        }
    }
}
