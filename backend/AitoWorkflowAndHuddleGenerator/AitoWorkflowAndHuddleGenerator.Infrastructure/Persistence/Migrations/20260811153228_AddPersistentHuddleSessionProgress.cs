using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPersistentHuddleSessionProgress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "UserHuddleSessions",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastSavedAtUtc",
                table: "UserHuddleSessions",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<string>(
                name: "SessionStatus",
                table: "UserHuddleSessions",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "StartedAtUtc",
                table: "UserHuddleSessions",
                type: "datetimeoffset",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddleSessions_OwnerObjectId_HuddleTopicId",
                table: "UserHuddleSessions",
                columns: new[] { "OwnerObjectId", "HuddleTopicId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserHuddleSessions_OwnerObjectId_HuddleTopicId",
                table: "UserHuddleSessions");

            migrationBuilder.DropColumn(
                name: "LastSavedAtUtc",
                table: "UserHuddleSessions");

            migrationBuilder.DropColumn(
                name: "SessionStatus",
                table: "UserHuddleSessions");

            migrationBuilder.DropColumn(
                name: "StartedAtUtc",
                table: "UserHuddleSessions");

            migrationBuilder.AlterColumn<string>(
                name: "Notes",
                table: "UserHuddleSessions",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000,
                oldNullable: true);
        }
    }
}
