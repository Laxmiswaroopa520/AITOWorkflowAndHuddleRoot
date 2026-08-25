IF DB_ID(N'AitoWorkflowAndHuddleGeneratorDb') IS NULL
BEGIN
    CREATE DATABASE AitoWorkflowAndHuddleGeneratorDb;
END;
GO


/*verify*/
SELECT
    name,
    create_date
FROM sys.databases
WHERE name =
    N'AitoWorkflowAndHuddleGeneratorDb';
GO