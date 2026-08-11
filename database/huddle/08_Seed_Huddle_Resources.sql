
USE [AitoWorkflowAndHuddleGeneratorDb];
GO
SET NOCOUNT ON;
SET XACT_ABORT ON;
GO
BEGIN TRY
    BEGIN TRANSACTION;
    DECLARE @SourceCount int = 0, @InsertedCount int = 0, @UpdatedCount int = 0, @SkippedCount int = 0, @DuplicateCount int = 0, @MissingRelationshipCount int = 0;
    DECLARE @Source TABLE (ExternalId nvarchar(100),Title nvarchar(300),Description nvarchar(max),Url nvarchar(2000),Type nvarchar(100),LinkLabel nvarchar(200));
    INSERT @Source VALUES
(N'RES-001',N'Sales Agent Capabilities Guide',N'Detailed reference for Sales Agent components, capabilities, and example prompts.',N'https://learn.microsoft.com/en-us/microsoft-sales-copilot/use-sales-chat',N'Internal guide',NULL),
(N'RES-002',N'Use Sales Agent in Microsoft 365 Copilot',N'Official overview and use guidance for Sales Agent.',N'https://learn.microsoft.com/en-us/microsoft-sales-copilot/use-sales-chat',N'Microsoft Learn',NULL),
(N'RES-003',N'Use Dynamics 365 Sales skills in Copilot Cowork',N'Official scenarios and skill model for Dynamics 365 Sales in Cowork.',N'https://m365.cloud.microsoft/cowork',N'Microsoft Learn',NULL),
(N'RES-004',N'AI Experience Card - Scout',N'Comparison of Copilot Chat, Cowork, and Scout plus Scout use guidance.',N'https://microsoft.sharepoint.com/sites/AIX/_layouts/15/Doc.aspx?sourcedoc=%7B3E810909-D461-46BB-ADEB-9791629CC4AD%7D&file=AI%20Experience%20Card%20-%20Scout.pptx&action=edit&mobileredirect=true&DefaultItemOpen=1',N'Internal deck',NULL),
(N'RES-005',N'Copilot Cowork Discussion Deck',N'Cowork overview, use cases, access, and facilitation cues.',N'https://microsoft.sharepoint.com/sites/AIX/_layouts/15/Doc.aspx?sourcedoc=%7B1B878D29-FBFE-4114-ADAE-F2F922B28F7C%7D&file=AI%20Experience%20Card%20-%20Cowork%20%28AITO%29.pptx&action=edit&mobileredirect=true&DefaultItemOpen=1',N'Internal deck',NULL),
(N'RES-006',N'MSXI Copilot - Chat with Your Data',N'MSXI Copilot description and AI-certified report model.',N'https://aka.ms/msxicopilotcollateral',N'Internal article',NULL),
(N'RES-007',N'Get started with Researcher',N'Official Researcher description and usage guidance.',N'https://support.microsoft.com/en-us/topic/get-started-with-researcher-in-microsoft-365-copilot-e63ab760-f3de-4c47-ae87-dad601b0e9c4',N'Microsoft Support',NULL),
(N'RES-008',N'Get started with Analyst',N'Official Analyst description and usage guidance.',N'https://support.microsoft.com/en-us/topic/get-started-with-analyst-in-microsoft-365-copilot-ff505b9c-a06c-4be9-b855-69d89b1d25d2',N'Microsoft Support',NULL);
    SELECT @SourceCount=COUNT(*) FROM @Source;
    SELECT @DuplicateCount=COUNT(*) FROM (SELECT ExternalId FROM @Source GROUP BY ExternalId HAVING COUNT(*)>1) d;
    IF @DuplicateCount>0 THROW 51001, 'Duplicate source external IDs.', 1;
    SELECT @UpdatedCount=COUNT(*) FROM dbo.HuddleResources t JOIN @Source s ON s.ExternalId=t.ExternalId;
    UPDATE t SET t.Title=s.Title,t.Description=s.Description,t.Url=s.Url,t.Type=s.Type,t.LinkLabel=s.LinkLabel, t.UpdatedAtUtc=SYSUTCDATETIME() FROM dbo.HuddleResources t JOIN @Source s ON s.ExternalId=t.ExternalId;
    INSERT dbo.HuddleResources (ExternalId,Title,Description,Url,Type,LinkLabel,CreatedAtUtc,UpdatedAtUtc)
    SELECT s.ExternalId,s.Title,s.Description,s.Url,s.Type,s.LinkLabel,SYSUTCDATETIME(),NULL FROM @Source s WHERE NOT EXISTS (SELECT 1 FROM dbo.HuddleResources t WHERE t.ExternalId=s.ExternalId);
    SET @InsertedCount=@@ROWCOUNT; SET @SkippedCount=@SourceCount-@InsertedCount-@UpdatedCount;
    SELECT @SourceCount AS SourceCount, @InsertedCount AS InsertedCount, @UpdatedCount AS UpdatedCount, @SkippedCount AS SkippedCount, @DuplicateCount AS DuplicateExternalIds, @MissingRelationshipCount AS MissingRelationships;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
