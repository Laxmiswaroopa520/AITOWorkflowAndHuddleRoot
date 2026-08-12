using System.Reflection;
using AitoWorkflowAndHuddleGenerator.Api.Authorization;
using AitoWorkflowAndHuddleGenerator.Api.Controllers;
using AitoWorkflowAndHuddleGenerator.Application.Features.Huddles.Coaching.Commands.BookCoach;
using AitoWorkflowAndHuddleGenerator.Contracts.Huddles.Coaching;
using Microsoft.AspNetCore.Authorization;

namespace AitoWorkflowAndHuddleGenerator.IntegrationTests.Huddles;

public sealed class HuddleCoachingApiTests
{
    [Fact]
    public void Controller_ShouldRequireAccessAsUserPolicy()
    {
        AuthorizeAttribute attribute = Assert.Single(typeof(HuddleCoachingController).GetCustomAttributes<AuthorizeAttribute>());
        Assert.Equal(Policies.AccessAsUser, attribute.Policy);
    }

    [Fact]
    public void BookingValidator_ShouldRejectMissingIdempotencyKeyAndUnsupportedDuration()
    {
        var request = new BookCoachRequest("coach-1", "topic-1", DateTime.UtcNow, DateTime.UtcNow.AddMinutes(45), "Asia/Kolkata", null, Guid.Empty);
        var result = new BookCoachCommandValidator().Validate(new BookCoachCommand(request));

        Assert.Contains(result.Errors, error => error.PropertyName.EndsWith("BookingRequestId"));
        Assert.Contains(result.Errors, error => error.ErrorMessage.Contains("30 or 60"));
    }
}
