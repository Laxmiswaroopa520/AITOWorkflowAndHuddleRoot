using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AitoWorkflowAndHuddleGenerator.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddHuddleDomainSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "HuddleAgents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    ShortDescription = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    WhatItIs = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WhatItHelpsYouDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WhenToUseIt = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KeyBenefits = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AccessUrl = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    AccessLinkLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleAgents", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HuddleFocusAreas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleFocusAreas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HuddleMcemStages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleMcemStages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HuddleResources",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Url = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    Type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LinkLabel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleResources", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HuddleSegments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleSegments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "HuddleTopics",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PublicationStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    HuddleFocusAreaId = table.Column<int>(type: "int", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    RecommendationPriority = table.Column<int>(type: "int", nullable: true),
                    AudienceDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TodayObjective = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UseCase = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WhyItMatters = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DesiredOutcome = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    StepsToGetStarted = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReflectionPrompt = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CommitmentPrompt = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KeyTakeaway = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleTopics", x => x.Id);
                    table.CheckConstraint("CK_HuddleTopics_DurationMinutes", "[DurationMinutes] IS NULL OR [DurationMinutes] > 0");
                    table.ForeignKey(
                        name: "FK_HuddleTopics_HuddleFocusAreas_HuddleFocusAreaId",
                        column: x => x.HuddleFocusAreaId,
                        principalTable: "HuddleFocusAreas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleAgentResources",
                columns: table => new
                {
                    HuddleAgentId = table.Column<int>(type: "int", nullable: false),
                    HuddleResourceId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleAgentResources", x => new { x.HuddleAgentId, x.HuddleResourceId });
                    table.ForeignKey(
                        name: "FK_HuddleAgentResources_HuddleAgents_HuddleAgentId",
                        column: x => x.HuddleAgentId,
                        principalTable: "HuddleAgents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleAgentResources_HuddleResources_HuddleResourceId",
                        column: x => x.HuddleResourceId,
                        principalTable: "HuddleResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleSegmentRoles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleSegmentId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false),
                    DisplayName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleSegmentRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HuddleSegmentRoles_HuddleSegments_HuddleSegmentId",
                        column: x => x.HuddleSegmentId,
                        principalTable: "HuddleSegments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleSegmentRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleFacilitatorGuides",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    SessionIntroduction = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    KeyTalkingPoints = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DiscussionQuestions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SuggestedTransitions = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WrapUpGuidance = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleFacilitatorGuides", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HuddleFacilitatorGuides_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddlePhases",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddlePhases", x => x.Id);
                    table.CheckConstraint("CK_HuddlePhases_DurationMinutes", "[DurationMinutes] IS NULL OR [DurationMinutes] > 0");
                    table.ForeignKey(
                        name: "FK_HuddlePhases_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleTopicAgents",
                columns: table => new
                {
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    HuddleAgentId = table.Column<int>(type: "int", nullable: false),
                    UsageType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DisplayLabel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShowAgentAccessLink = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleTopicAgents", x => new { x.HuddleTopicId, x.HuddleAgentId, x.UsageType });
                    table.ForeignKey(
                        name: "FK_HuddleTopicAgents_HuddleAgents_HuddleAgentId",
                        column: x => x.HuddleAgentId,
                        principalTable: "HuddleAgents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleTopicAgents_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleTopicMcemStages",
                columns: table => new
                {
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    HuddleMcemStageId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleTopicMcemStages", x => new { x.HuddleTopicId, x.HuddleMcemStageId });
                    table.ForeignKey(
                        name: "FK_HuddleTopicMcemStages_HuddleMcemStages_HuddleMcemStageId",
                        column: x => x.HuddleMcemStageId,
                        principalTable: "HuddleMcemStages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleTopicMcemStages_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleTopicResources",
                columns: table => new
                {
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    HuddleResourceId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleTopicResources", x => new { x.HuddleTopicId, x.HuddleResourceId });
                    table.ForeignKey(
                        name: "FK_HuddleTopicResources_HuddleResources_HuddleResourceId",
                        column: x => x.HuddleResourceId,
                        principalTable: "HuddleResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleTopicResources_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleTopicRoles",
                columns: table => new
                {
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    RoleId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleTopicRoles", x => new { x.HuddleTopicId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_HuddleTopicRoles_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleTopicRoles_Roles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleVotes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false),
                    DownvoteReasons = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleVotes", x => x.Id);
                    table.CheckConstraint("CK_HuddleVotes_Value", "[Value] IN (-1, 1)");
                    table.ForeignKey(
                        name: "FK_HuddleVotes_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleRolePathItems",
                columns: table => new
                {
                    HuddleSegmentRoleId = table.Column<int>(type: "int", nullable: false),
                    WeekPosition = table.Column<int>(type: "int", nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleRolePathItems", x => new { x.HuddleSegmentRoleId, x.WeekPosition });
                    table.CheckConstraint("CK_HuddleRolePathItems_WeekPosition", "[WeekPosition] > 0");
                    table.ForeignKey(
                        name: "FK_HuddleRolePathItems_HuddleSegmentRoles_HuddleSegmentRoleId",
                        column: x => x.HuddleSegmentRoleId,
                        principalTable: "HuddleSegmentRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleRolePathItems_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserHuddlePlans",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleSegmentRoleId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHuddlePlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserHuddlePlans_HuddleSegmentRoles_HuddleSegmentRoleId",
                        column: x => x.HuddleSegmentRoleId,
                        principalTable: "HuddleSegmentRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExternalId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    HuddlePhaseId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    Prompt = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpectedOutput = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HumanCheckpoint = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiredContext = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BestFitJob = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleActivities", x => x.Id);
                    table.CheckConstraint("CK_HuddleActivities_DurationMinutes", "[DurationMinutes] IS NULL OR [DurationMinutes] > 0");
                    table.ForeignKey(
                        name: "FK_HuddleActivities_HuddlePhases_HuddlePhaseId",
                        column: x => x.HuddlePhaseId,
                        principalTable: "HuddlePhases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleActivities_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserHuddleSessions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerObjectId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false),
                    CurrentHuddlePhaseId = table.Column<int>(type: "int", nullable: true),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    CreatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    UpdatedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHuddleSessions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserHuddleSessions_HuddlePhases_CurrentHuddlePhaseId",
                        column: x => x.CurrentHuddlePhaseId,
                        principalTable: "HuddlePhases",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserHuddleSessions_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserHuddlePlanItems",
                columns: table => new
                {
                    UserHuddlePlanId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WeekPosition = table.Column<int>(type: "int", nullable: false),
                    HuddleTopicId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHuddlePlanItems", x => new { x.UserHuddlePlanId, x.WeekPosition });
                    table.CheckConstraint("CK_UserHuddlePlanItems_WeekPosition", "[WeekPosition] > 0");
                    table.ForeignKey(
                        name: "FK_UserHuddlePlanItems_HuddleTopics_HuddleTopicId",
                        column: x => x.HuddleTopicId,
                        principalTable: "HuddleTopics",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserHuddlePlanItems_UserHuddlePlans_UserHuddlePlanId",
                        column: x => x.UserHuddlePlanId,
                        principalTable: "UserHuddlePlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "HuddleActivityAgents",
                columns: table => new
                {
                    HuddleActivityId = table.Column<int>(type: "int", nullable: false),
                    HuddleAgentId = table.Column<int>(type: "int", nullable: false),
                    UsageType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    DisplayLabel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShowAgentAccessLink = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleActivityAgents", x => new { x.HuddleActivityId, x.HuddleAgentId, x.UsageType });
                    table.ForeignKey(
                        name: "FK_HuddleActivityAgents_HuddleActivities_HuddleActivityId",
                        column: x => x.HuddleActivityId,
                        principalTable: "HuddleActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleActivityAgents_HuddleAgents_HuddleAgentId",
                        column: x => x.HuddleAgentId,
                        principalTable: "HuddleAgents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HuddleActivityResources",
                columns: table => new
                {
                    HuddleActivityId = table.Column<int>(type: "int", nullable: false),
                    HuddleResourceId = table.Column<int>(type: "int", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HuddleActivityResources", x => new { x.HuddleActivityId, x.HuddleResourceId });
                    table.ForeignKey(
                        name: "FK_HuddleActivityResources_HuddleActivities_HuddleActivityId",
                        column: x => x.HuddleActivityId,
                        principalTable: "HuddleActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HuddleActivityResources_HuddleResources_HuddleResourceId",
                        column: x => x.HuddleResourceId,
                        principalTable: "HuddleResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserHuddleActivityProgress",
                columns: table => new
                {
                    UserHuddleSessionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    HuddleActivityId = table.Column<int>(type: "int", nullable: false),
                    IsCompleted = table.Column<bool>(type: "bit", nullable: false),
                    CompletedAtUtc = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserHuddleActivityProgress", x => new { x.UserHuddleSessionId, x.HuddleActivityId });
                    table.ForeignKey(
                        name: "FK_UserHuddleActivityProgress_HuddleActivities_HuddleActivityId",
                        column: x => x.HuddleActivityId,
                        principalTable: "HuddleActivities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserHuddleActivityProgress_UserHuddleSessions_UserHuddleSessionId",
                        column: x => x.UserHuddleSessionId,
                        principalTable: "UserHuddleSessions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_ExternalId",
                table: "HuddleActivities",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_HuddlePhaseId_DisplayOrder",
                table: "HuddleActivities",
                columns: new[] { "HuddlePhaseId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivities_HuddleTopicId",
                table: "HuddleActivities",
                column: "HuddleTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivityAgents_HuddleActivityId_DisplayOrder",
                table: "HuddleActivityAgents",
                columns: new[] { "HuddleActivityId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivityAgents_HuddleAgentId",
                table: "HuddleActivityAgents",
                column: "HuddleAgentId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivityResources_HuddleActivityId_DisplayOrder",
                table: "HuddleActivityResources",
                columns: new[] { "HuddleActivityId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleActivityResources_HuddleResourceId",
                table: "HuddleActivityResources",
                column: "HuddleResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleAgentResources_HuddleAgentId_DisplayOrder",
                table: "HuddleAgentResources",
                columns: new[] { "HuddleAgentId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleAgentResources_HuddleResourceId",
                table: "HuddleAgentResources",
                column: "HuddleResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleAgents_ExternalId",
                table: "HuddleAgents",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleFacilitatorGuides_ExternalId",
                table: "HuddleFacilitatorGuides",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleFacilitatorGuides_HuddleTopicId",
                table: "HuddleFacilitatorGuides",
                column: "HuddleTopicId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleFocusAreas_ExternalId",
                table: "HuddleFocusAreas",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleMcemStages_ExternalId",
                table: "HuddleMcemStages",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePhases_ExternalId",
                table: "HuddlePhases",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddlePhases_HuddleTopicId_DisplayOrder",
                table: "HuddlePhases",
                columns: new[] { "HuddleTopicId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleResources_ExternalId",
                table: "HuddleResources",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleRolePathItems_HuddleTopicId",
                table: "HuddleRolePathItems",
                column: "HuddleTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleSegmentRoles_ExternalId",
                table: "HuddleSegmentRoles",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleSegmentRoles_HuddleSegmentId_RoleId",
                table: "HuddleSegmentRoles",
                columns: new[] { "HuddleSegmentId", "RoleId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleSegmentRoles_RoleId",
                table: "HuddleSegmentRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleSegments_ExternalId",
                table: "HuddleSegments",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicAgents_HuddleAgentId",
                table: "HuddleTopicAgents",
                column: "HuddleAgentId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicAgents_HuddleTopicId_DisplayOrder",
                table: "HuddleTopicAgents",
                columns: new[] { "HuddleTopicId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicMcemStages_HuddleMcemStageId",
                table: "HuddleTopicMcemStages",
                column: "HuddleMcemStageId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicMcemStages_HuddleTopicId_DisplayOrder",
                table: "HuddleTopicMcemStages",
                columns: new[] { "HuddleTopicId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicResources_HuddleResourceId",
                table: "HuddleTopicResources",
                column: "HuddleResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicResources_HuddleTopicId_DisplayOrder",
                table: "HuddleTopicResources",
                columns: new[] { "HuddleTopicId", "DisplayOrder" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopicRoles_RoleId",
                table: "HuddleTopicRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopics_ExternalId",
                table: "HuddleTopics",
                column: "ExternalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HuddleTopics_HuddleFocusAreaId",
                table: "HuddleTopics",
                column: "HuddleFocusAreaId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleVotes_HuddleTopicId",
                table: "HuddleVotes",
                column: "HuddleTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_HuddleVotes_OwnerObjectId_HuddleTopicId",
                table: "HuddleVotes",
                columns: new[] { "OwnerObjectId", "HuddleTopicId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddleActivityProgress_HuddleActivityId",
                table: "UserHuddleActivityProgress",
                column: "HuddleActivityId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddlePlanItems_HuddleTopicId",
                table: "UserHuddlePlanItems",
                column: "HuddleTopicId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddlePlans_HuddleSegmentRoleId",
                table: "UserHuddlePlans",
                column: "HuddleSegmentRoleId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddleSessions_CurrentHuddlePhaseId",
                table: "UserHuddleSessions",
                column: "CurrentHuddlePhaseId");

            migrationBuilder.CreateIndex(
                name: "IX_UserHuddleSessions_HuddleTopicId",
                table: "UserHuddleSessions",
                column: "HuddleTopicId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "HuddleActivityAgents");

            migrationBuilder.DropTable(
                name: "HuddleActivityResources");

            migrationBuilder.DropTable(
                name: "HuddleAgentResources");

            migrationBuilder.DropTable(
                name: "HuddleFacilitatorGuides");

            migrationBuilder.DropTable(
                name: "HuddleRolePathItems");

            migrationBuilder.DropTable(
                name: "HuddleTopicAgents");

            migrationBuilder.DropTable(
                name: "HuddleTopicMcemStages");

            migrationBuilder.DropTable(
                name: "HuddleTopicResources");

            migrationBuilder.DropTable(
                name: "HuddleTopicRoles");

            migrationBuilder.DropTable(
                name: "HuddleVotes");

            migrationBuilder.DropTable(
                name: "UserHuddleActivityProgress");

            migrationBuilder.DropTable(
                name: "UserHuddlePlanItems");

            migrationBuilder.DropTable(
                name: "HuddleAgents");

            migrationBuilder.DropTable(
                name: "HuddleMcemStages");

            migrationBuilder.DropTable(
                name: "HuddleResources");

            migrationBuilder.DropTable(
                name: "HuddleActivities");

            migrationBuilder.DropTable(
                name: "UserHuddleSessions");

            migrationBuilder.DropTable(
                name: "UserHuddlePlans");

            migrationBuilder.DropTable(
                name: "HuddlePhases");

            migrationBuilder.DropTable(
                name: "HuddleSegmentRoles");

            migrationBuilder.DropTable(
                name: "HuddleTopics");

            migrationBuilder.DropTable(
                name: "HuddleSegments");

            migrationBuilder.DropTable(
                name: "HuddleFocusAreas");
        }
    }
}
