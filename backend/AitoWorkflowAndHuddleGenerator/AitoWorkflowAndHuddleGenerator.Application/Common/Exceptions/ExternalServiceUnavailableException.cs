namespace AitoWorkflowAndHuddleGenerator.Application.Common.Exceptions;

public sealed class ExternalServiceUnavailableException(string message) : Exception(message);
