//The design-time factory lets EF Core create ApplicationDbContext while generating migrations.
/*The simple answer is:

ApplicationDbContext is used when your application is running.
DesignTimeDbContextFactory is used only by EF Core tools (like Add-Migration and Update-Database) when your application is not running.*/
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence;

/// <summary>
/// Creates Design Time Db Context instances.
/// </summary>
public sealed class DesignTimeDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    /// <summary>
    /// Creates a configured application database context.
    /// </summary>
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        string environment =
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
            ?? "Development";

        string basePath = Directory.GetCurrentDirectory();

        string appSettingsPath =
            Path.Combine(basePath, "appsettings.json");

        if (!File.Exists(appSettingsPath))
        {
            throw new FileNotFoundException(
                ConfigurationMessages.AppSettingsNotFound(appSettingsPath));
        }

        IConfigurationRoot configuration =
            new ConfigurationBuilder()              ////Read configuration values from different sources like app settings.json file from api project like that  and combine them into one configuration object.
                .SetBasePath(basePath)
                .AddJsonFile(
                    "appsettings.json",
                    optional: false,
                    reloadOnChange: false)
                .AddJsonFile(
                    $"appsettings.{environment}.json",
                    optional: true,
                    reloadOnChange: false)
                .AddEnvironmentVariables()
                .Build();

        string connectionString =
            configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                ConfigurationMessages.DefaultConnectionRequiredForEnvironment(environment));

        var optionsBuilder =
            new DbContextOptionsBuilder<ApplicationDbContext>();

        optionsBuilder.UseSqlServer(
            connectionString,
            sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(
                    typeof(ApplicationDbContext)
                        .Assembly
                        .FullName);
            });

        return new ApplicationDbContext(
            optionsBuilder.Options);
    }
}







/*using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace AitoWorkflowAndHuddleGenerator
    .Infrastructure
    .Persistence;

public sealed class DesignTimeDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        string connectionString =
            Environment.GetEnvironmentVariable(
                "ConnectionStrings__DefaultConnection")
            ?? "Server=COGNINE-L220\\SQLEXPRESS;" +
               "Database=AitoWorkflowAndHuddleGeneratorDb;" +
               "Trusted_Connection=True;" +
               "TrustServerCertificate=True;" +
               "MultipleActiveResultSets=True";

        var optionsBuilder =
            new DbContextOptionsBuilder<ApplicationDbContext>();

        optionsBuilder.UseSqlServer(
            connectionString,
            sqlOptions =>
            {
                sqlOptions.MigrationsAssembly(
                    typeof(ApplicationDbContext)
                        .Assembly
                        .FullName);
            });

        return new ApplicationDbContext(
            optionsBuilder.Options);
    }
}
*/