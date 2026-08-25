using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiTools",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Color = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    IconKey = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiTools", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Abbreviation = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Segment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowBuckets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkflowBuckets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserWorkflows",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    OwnerObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OwnerEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    OwnerDisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    TotalDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    IsFavorite = table.Column<bool>(type: "bit", nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWorkflows", x => x.Id);
                    table.CheckConstraint("CK_UserWorkflows_TotalDurationMinutes", "[TotalDurationMinutes] >= 0");
                    table.ForeignKey(
                        name: "FK_UserWorkflows_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Activities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    WorkflowBucketId = table.Column<int>(type: "int", nullable: false),
                    Category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Frequency = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ToolCoverageLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TriggerContext = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    McemStage = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    BusinessOutcome = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    BeginnerPrompt = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdvancedPrompt = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SuggestedOutputs = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Activities", x => x.Id);
                    table.CheckConstraint("CK_Activities_DurationMinutes", "[DurationMinutes] >= 0");
                    table.ForeignKey(
                        name: "FK_Activities_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Activities_WorkflowBuckets_WorkflowBucketId",
                        column: x => x.WorkflowBucketId,
                        principalTable: "WorkflowBuckets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkflowShares",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserWorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecipientObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    RecipientEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    RecipientDisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SharedByObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SharedByEmail = table.Column<string>(type: "nvarchar(320)", maxLength: 320, nullable: false),
                    SharedByDisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    IsRevoked = table.Column<bool>(type: "bit", nullable: false),
                    RevokedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
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

            migrationBuilder.CreateTable(
                name: "ActivityAiTools",
                columns: table => new
                {
                    ActivityId = table.Column<int>(type: "int", nullable: false),
                    AiToolId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    IsPrimary = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityAiTools", x => new { x.ActivityId, x.AiToolId });
                    table.ForeignKey(
                        name: "FK_ActivityAiTools_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ActivityAiTools_AiTools_AiToolId",
                        column: x => x.AiToolId,
                        principalTable: "AiTools",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserWorkflowActivities",
                columns: table => new
                {
                    UserWorkflowId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActivityId = table.Column<int>(type: "int", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    AddedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserWorkflowActivities", x => new { x.UserWorkflowId, x.ActivityId });
                    table.ForeignKey(
                        name: "FK_UserWorkflowActivities_Activities_ActivityId",
                        column: x => x.ActivityId,
                        principalTable: "Activities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserWorkflowActivities_UserWorkflows_UserWorkflowId",
                        column: x => x.UserWorkflowId,
                        principalTable: "UserWorkflows",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_Category",
                table: "Activities",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_ExternalId",
                table: "Activities",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Activities_McemStage",
                table: "Activities",
                column: "McemStage");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_Priority",
                table: "Activities",
                column: "Priority");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_RoleId",
                table: "Activities",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_Activities_RoleId_WorkflowBucketId_IsActive",
                table: "Activities",
                columns: new[] { "RoleId", "WorkflowBucketId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Activities_WorkflowBucketId",
                table: "Activities",
                column: "WorkflowBucketId");

            migrationBuilder.CreateIndex(
                name: "IX_ActivityAiTools_AiToolId",
                table: "ActivityAiTools",
                column: "AiToolId");

            migrationBuilder.CreateIndex(
                name: "IX_AiTools_ExternalId",
                table: "AiTools",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AiTools_IsActive_SortOrder",
                table: "AiTools",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_AiTools_Name",
                table: "AiTools",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_ExternalId",
                table: "Roles",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_IsActive_SortOrder",
                table: "Roles",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_Roles_Name",
                table: "Roles",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkflowActivities_ActivityId",
                table: "UserWorkflowActivities",
                column: "ActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkflowActivities_UserWorkflowId_SortOrder",
                table: "UserWorkflowActivities",
                columns: new[] { "UserWorkflowId", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkflows_OwnerObjectId",
                table: "UserWorkflows",
                column: "OwnerObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkflows_OwnerObjectId_IsFavorite",
                table: "UserWorkflows",
                columns: new[] { "OwnerObjectId", "IsFavorite" });

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkflows_OwnerObjectId_Name",
                table: "UserWorkflows",
                columns: new[] { "OwnerObjectId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserWorkflows_RoleId",
                table: "UserWorkflows",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowBuckets_ExternalId",
                table: "WorkflowBuckets",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowBuckets_IsActive_SortOrder",
                table: "WorkflowBuckets",
                columns: new[] { "IsActive", "SortOrder" });

            migrationBuilder.CreateIndex(
                name: "IX_WorkflowBuckets_Name",
                table: "WorkflowBuckets",
                column: "Name",
                unique: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ActivityAiTools");

            migrationBuilder.DropTable(
                name: "UserWorkflowActivities");

            migrationBuilder.DropTable(
                name: "WorkflowShares");

            migrationBuilder.DropTable(
                name: "AiTools");

            migrationBuilder.DropTable(
                name: "Activities");

            migrationBuilder.DropTable(
                name: "UserWorkflows");

            migrationBuilder.DropTable(
                name: "WorkflowBuckets");

            migrationBuilder.DropTable(
                name: "Roles");
        }
    }
}
