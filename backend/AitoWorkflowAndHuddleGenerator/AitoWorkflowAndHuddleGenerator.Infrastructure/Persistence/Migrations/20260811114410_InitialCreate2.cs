using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserHuddlePlans_OwnerObjectId_HuddleSegmentRoleId",
                table: "UserHuddlePlans",
                columns: new[] { "OwnerObjectId", "HuddleSegmentRoleId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserHuddlePlans_OwnerObjectId_HuddleSegmentRoleId",
                table: "UserHuddlePlans");
        }
    }
}
