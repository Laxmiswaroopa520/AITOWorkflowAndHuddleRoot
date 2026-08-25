using System.IO.Compression;
using Microsoft.AspNetCore.ResponseCompression;

namespace AitoWorkflowAndHuddleGenerator.Api.Extensions;

/// <summary>
/// Provides Service Collection Extensions operations and constants.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Registers or adds Api Services functionality.
    /// </summary>
    public static IServiceCollection AddApiServices(
        this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddControllers();
        services.AddProblemDetails();

        // The catalogue and Role Path responses repeat the same agent narrative on every card,
        // so they compress by roughly ten to one. Enabled over HTTPS because these payloads
        // carry nothing the caller does not already hold and no attacker-supplied text is
        // reflected back in them.
        services.AddResponseCompression(options =>
        {
            options.EnableForHttps = true;
            options.Providers.Add<BrotliCompressionProvider>();
            options.Providers.Add<GzipCompressionProvider>();
            options.MimeTypes = ResponseCompressionDefaults.MimeTypes
                .Concat(["application/problem+json"]);
        });

        services.Configure<BrotliCompressionProviderOptions>(
            options => options.Level = CompressionLevel.Fastest);
        services.Configure<GzipCompressionProviderOptions>(
            options => options.Level = CompressionLevel.Fastest);

        return services;
    }
}
