BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    ALTER TABLE [UserHuddlePlanItems] ADD [HuddlePlacementId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    CREATE INDEX [IX_UserHuddlePlanItems_HuddlePlacementId] ON [UserHuddlePlanItems] ([HuddlePlacementId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    ALTER TABLE [UserHuddlePlanItems] ADD CONSTRAINT [FK_UserHuddlePlanItems_HuddlePlacements_HuddlePlacementId] FOREIGN KEY ([HuddlePlacementId]) REFERENCES [HuddlePlacements] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260821114851_AddUserHuddlePlanItemPlacement'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260821114851_AddUserHuddlePlanItemPlacement', N'9.0.18');
END;

COMMIT;
GO

