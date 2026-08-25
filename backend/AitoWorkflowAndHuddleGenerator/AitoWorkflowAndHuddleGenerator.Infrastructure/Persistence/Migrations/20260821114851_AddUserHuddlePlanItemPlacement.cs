using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserHuddlePlanItemPlacement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "HuddlePlacementId",
                table: "UserHuddlePlanItems",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddlePlanItems_HuddlePlacementId",
                table: "UserHuddlePlanItems",
                column: "HuddlePlacementId");

            migrationBuilder.AddForeignKey(
                name: "FK_UserHuddlePlanItems_HuddlePlacements_HuddlePlacementId",
                table: "UserHuddlePlanItems",
                column: "HuddlePlacementId",
                principalTable: "HuddlePlacements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserHuddlePlanItems_HuddlePlacements_HuddlePlacementId",
                table: "UserHuddlePlanItems");

            migrationBuilder.DropIndex(
                name: "IX_UserHuddlePlanItems_HuddlePlacementId",
                table: "UserHuddlePlanItems");

            migrationBuilder.DropColumn(
                name: "HuddlePlacementId",
                table: "UserHuddlePlanItems");
        }
    }
}
