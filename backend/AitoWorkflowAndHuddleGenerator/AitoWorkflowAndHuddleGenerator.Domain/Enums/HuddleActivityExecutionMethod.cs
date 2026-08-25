namespace AitoWorkflowAndHuddleGenerator.Domain.Enums;

/// <summary>
/// Defines how a Huddle activity is carried out. Derived from whether the content
/// workbook supplies a prompt, step-by-step instructions, or both.
/// </summary>
public enum HuddleActivityExecutionMethod
{
    /// <summary>Prompt only; the activity is run by pasting the prompt into an agent.</summary>
    Prompt = 1,

    /// <summary>Steps only; the activity is a click-through task with no prompt.</summary>
    Activity = 2,

    /// <summary>Both a prompt and step-by-step instructions are supplied.</summary>
    Both = 3
}
