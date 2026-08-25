//Reads active AI tools from SQL.
using AitoWorkflowAndHuddleGenerator
    .Application
    .Abstractions
    .Persistence;
using AitoWorkflowAndHuddleGenerator.Contracts.AiTools;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Features
    .AiTools
    .Queries
    .GetAiTools;

/// <summary>
/// Handles the Get Ai Tools query.
/// </summary>
public sealed class GetAiToolsQueryHandler
    : IRequestHandler<
        GetAiToolsQuery,
        IReadOnlyList<AiToolResponse>>
{
    private readonly IApplicationDbContext dbContext;

    public GetAiToolsQueryHandler(
        IApplicationDbContext dbContext)
    {
        this.dbContext = dbContext;
    }

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<IReadOnlyList<AiToolResponse>> Handle(
        GetAiToolsQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.AiTool> query =
            dbContext.AiTools.AsNoTracking();

        if (!request.IncludeInactive)
        {
            query = query.Where(tool => tool.IsActive);
        }

        return await query
            .OrderBy(tool => tool.SortOrder)
            .ThenBy(tool => tool.Name)
            .Select(tool => new AiToolResponse(
                tool.Id,
                tool.ExternalId,
                tool.Name,
                tool.Description,
                tool.Color,
                tool.IconKey,
                tool.SortOrder))
            .ToListAsync(cancellationToken);
    }
}