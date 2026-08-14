using FluentValidation;
namespace AitoWorkflowAndHuddleGenerator.Application.Features.Workflows.Calendar.Commands.AddWorkflowCalendarEvents;
/// <summary>
/// Validates Add Workflow Calendar Events Command requests.
/// </summary>
public sealed class AddWorkflowCalendarEventsCommandValidator : AbstractValidator<AddWorkflowCalendarEventsCommand>
{
    public AddWorkflowCalendarEventsCommandValidator()
    {
        RuleFor(x => x.Events).NotEmpty().Must(x => x.Count <= 100);
        RuleForEach(x => x.Events).ChildRules(item =>
        {
            item.RuleFor(x => x.RequestId).NotEmpty();
            item.RuleFor(x => x.Subject).NotEmpty().MaximumLength(255);
            item.RuleFor(x => x.Body).MaximumLength(10000);
            item.RuleFor(x => x.TimeZone).NotEmpty().MaximumLength(100);
            item.RuleFor(x => x.EndUtc).GreaterThan(x => x.StartUtc);
        });
    }
}
