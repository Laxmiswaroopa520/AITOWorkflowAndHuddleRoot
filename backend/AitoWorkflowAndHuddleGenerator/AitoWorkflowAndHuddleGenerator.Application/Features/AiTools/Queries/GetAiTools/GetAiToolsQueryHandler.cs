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

public sealed class GetAiToolsQueryHandler
    : IRequestHandler<
        GetAiToolsQuery,
        IReadOnlyList<AiToolResponse>>
{
    private readonly IApplicationDbContext _dbContext;

    public GetAiToolsQueryHandler(
        IApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyList<AiToolResponse>> Handle(
        GetAiToolsQuery request,
        CancellationToken cancellationToken)
    {
        IQueryable<Domain.Entities.AiTool> query =
            _dbContext.AiTools.AsNoTracking();

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