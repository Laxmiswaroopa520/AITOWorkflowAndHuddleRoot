using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NewMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_HuddlePhases_HuddleTopicId_DisplayOrder",
                table: "HuddlePhases");

            migrationBuilder.DropIndex(
                name: "IX_HuddleFacilitatorGuides_HuddleTopicId",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropIndex(
                name: "IX_HuddleActivities_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities");

            migrationBuilder.AddColumn<bool>(
                name: "IsGlobal",
                table: "HuddleResources",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "HuddlePlacementId",
                table: "HuddlePhases",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "StageNumber",
                table: "HuddleMcemStages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BringBackEvidence",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CommitPrompt",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FacilitatorQuestions",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FallbackGuidance",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "HuddlePlacementId",
                table: "HuddleFacilitatorGuides",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ListenFor",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreparationChecklist",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReflectPrompt",
                table: "HuddleFacilitatorGuides",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StepsToGetStarted",
                table: "HuddleAgents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhenNotToUseIt",
                table: "HuddleAgents",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ActivitySteps",
                table: "HuddleActivities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExecutionMethod",
                table: "HuddleActivities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "HuddlePlacementId",
                table: "HuddleActivities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LaunchLabel",
                table: "HuddleActivities",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LaunchUrl",
                table: "HuddleActivities",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PracticeTier",
                table: "HuddleActivities",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PrerequisiteHuddleActivityId",
                table: "HuddleActivities",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WhyThisMatters",
                table: "HuddleActivities",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "HuddlePlacements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleSegmentRoleId = table.Column<int>(type: "int", nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    PathSection = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Sequence = table.Column<int>(type: "int", nullable: false),
                    RoleTopicName = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    RoleTopicDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TodayObjective = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Wiifm = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DesiredOutcome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddlePlacements", x => x.Id);
                    table.CheckConstraint("CK_HuddlePlacements_Sequence", "[Sequence] > 0");
                    table.ForeignKey(
                        name: "FK_HuddlePlacements_HuddleSegmentRoles_HuddleSegmentRoleId",
                        column: x => x.HuddleSegmentRoleId,
                        principalTable: "HuddleSegmentRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddlePlacements_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePhases_HuddlePlacementId_DisplayOrder",
                table: "HuddlePhases",
                columns: new[] { "HuddlePlacementId", "DisplayOrder" },
                unique: true,
                filter: "[HuddlePlacementId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePhases_HuddleTopicId_DisplayOrder",
                table: "HuddlePhases",
                columns: new[] { "HuddleTopicId", "DisplayOrder" },
                unique: true,
                filter: "[HuddlePlacementId] IS NULL");

            migrationBuilder.AddCheckConstraint(
                name: "CK_HuddleMcemStages_StageNumber",
                table: "HuddleMcemStages",
                sql: "[StageNumber] IS NULL OR [StageNumber] BETWEEN 1 AND 5");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleFacilitatorGuides_HuddlePlacementId",
                table: "HuddleFacilitatorGuides",
                column: "HuddlePlacementId",
                unique: true,
                filter: "[HuddlePlacementId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleFacilitatorGuides_HuddleTopicId",
                table: "HuddleFacilitatorGuides",
                column: "HuddleTopicId",
                unique: true,
                filter: "[HuddlePlacementId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities",
                columns: new[] { "HuddlePhaseId", "DisplayOrder" },
                unique: true,
                filter: "[HuddlePlacementId] IS NULL");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_HuddlePlacementId_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities",
                columns: new[] { "HuddlePlacementId", "HuddlePhaseId", "DisplayOrder" },
                unique: true,
                filter: "[HuddlePlacementId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_HuddlePlacementId_PracticeTier",
                table: "HuddleActivities",
                columns: new[] { "HuddlePlacementId", "PracticeTier" });

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_PrerequisiteHuddleActivityId",
                table: "HuddleActivities",
                column: "PrerequisiteHuddleActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePlacements_ExternalId",
                table: "HuddlePlacements",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePlacements_HuddleSegmentRoleId_PathSection_Sequence",
                table: "HuddlePlacements",
                columns: new[] { "HuddleSegmentRoleId", "PathSection", "Sequence" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePlacements_HuddleTopicId",
                table: "HuddlePlacements",
                column: "HuddleTopicId");

            migrationBuilder.AddForeignKey(
                name: "FK_HuddleActivities_HuddleActivities_PrerequisiteHuddleActivityId",
                table: "HuddleActivities",
                column: "PrerequisiteHuddleActivityId",
                principalTable: "HuddleActivities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_HuddleActivities_HuddlePlacements_HuddlePlacementId",
                table: "HuddleActivities",
                column: "HuddlePlacementId",
                principalTable: "HuddlePlacements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HuddleFacilitatorGuides_HuddlePlacements_HuddlePlacementId",
                table: "HuddleFacilitatorGuides",
                column: "HuddlePlacementId",
                principalTable: "HuddlePlacements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_HuddlePhases_HuddlePlacements_HuddlePlacementId",
                table: "HuddlePhases",
                column: "HuddlePlacementId",
                principalTable: "HuddlePlacements",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HuddleActivities_HuddleActivities_PrerequisiteHuddleActivityId",
                table: "HuddleActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_HuddleActivities_HuddlePlacements_HuddlePlacementId",
                table: "HuddleActivities");

            migrationBuilder.DropForeignKey(
                name: "FK_HuddleFacilitatorGuides_HuddlePlacements_HuddlePlacementId",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropForeignKey(
                name: "FK_HuddlePhases_HuddlePlacements_HuddlePlacementId",
                table: "HuddlePhases");

            migrationBuilder.DropTable(
                name: "HuddlePlacements");

            migrationBuilder.DropIndex(
                name: "IX_HuddlePhases_HuddlePlacementId_DisplayOrder",
                table: "HuddlePhases");

            migrationBuilder.DropIndex(
                name: "IX_HuddlePhases_HuddleTopicId_DisplayOrder",
                table: "HuddlePhases");

            migrationBuilder.DropCheckConstraint(
                name: "CK_HuddleMcemStages_StageNumber",
                table: "HuddleMcemStages");

            migrationBuilder.DropIndex(
                name: "IX_HuddleFacilitatorGuides_HuddlePlacementId",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropIndex(
                name: "IX_HuddleFacilitatorGuides_HuddleTopicId",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropIndex(
                name: "IX_HuddleActivities_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities");

            migrationBuilder.DropIndex(
                name: "IX_HuddleActivities_HuddlePlacementId_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities");

            migrationBuilder.DropIndex(
                name: "IX_HuddleActivities_HuddlePlacementId_PracticeTier",
                table: "HuddleActivities");

            migrationBuilder.DropIndex(
                name: "IX_HuddleActivities_PrerequisiteHuddleActivityId",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "IsGlobal",
                table: "HuddleResources");

            migrationBuilder.DropColumn(
                name: "HuddlePlacementId",
                table: "HuddlePhases");

            migrationBuilder.DropColumn(
                name: "StageNumber",
                table: "HuddleMcemStages");

            migrationBuilder.DropColumn(
                name: "BringBackEvidence",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "CommitPrompt",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "FacilitatorQuestions",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "FallbackGuidance",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "HuddlePlacementId",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "ListenFor",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "PreparationChecklist",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "ReflectPrompt",
                table: "HuddleFacilitatorGuides");

            migrationBuilder.DropColumn(
                name: "StepsToGetStarted",
                table: "HuddleAgents");

            migrationBuilder.DropColumn(
                name: "WhenNotToUseIt",
                table: "HuddleAgents");

            migrationBuilder.DropColumn(
                name: "ActivitySteps",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "ExecutionMethod",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "HuddlePlacementId",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "LaunchLabel",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "LaunchUrl",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "PracticeTier",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "PrerequisiteHuddleActivityId",
                table: "HuddleActivities");

            migrationBuilder.DropColumn(
                name: "WhyThisMatters",
                table: "HuddleActivities");

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePhases_HuddleTopicId_DisplayOrder",
                table: "HuddlePhases",
                columns: new[] { "HuddleTopicId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleFacilitatorGuides_HuddleTopicId",
                table: "HuddleFacilitatorGuides",
                column: "HuddleTopicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities",
                columns: new[] { "HuddlePhaseId", "DisplayOrder" },
                unique: true);
        }
    }
}
