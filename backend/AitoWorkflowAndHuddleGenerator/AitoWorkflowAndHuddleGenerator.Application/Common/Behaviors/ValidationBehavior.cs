//Runs FluentValidation validators before MediatR handlers.
using FluentValidation;
using MediatR;

namespace AitoWorkflowAndHuddleGenerator
    .Application
    .Common
    .Behaviors;

/// <summary>
/// Represents the Validation Behavior model.
/// </summary>
public sealed class ValidationBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IEnumerable<IValidator<TRequest>>
        validators;

    public ValidationBehavior(
        IEnumerable<IValidator<TRequest>> validators)
    {
        this.validators = validators;
    }

    /// <summary>
    /// Handles the request through the application pipeline.
    /// </summary>

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!validators.Any())
        {
            return await next();
        }

        ValidationContext<TRequest> context =
            new(request);

        FluentValidation.Results.ValidationResult[]
            validationResults =
                await Task.WhenAll(
                    validators.Select(
                        validator =>
                            validator.ValidateAsync(
                                context,
                                cancellationToken)));

        FluentValidation.Results.ValidationFailure[]
            failures =
                validationResults
                    .SelectMany(result => result.Errors)
                    .Where(failure => failure is not null)
                    .ToArray();

        if (failures.Length > 0)
        {
            throw new ValidationException(failures);
        }

        return await next();
    }
}