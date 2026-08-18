/*const legacyToApiRoleMap:
  Record<string, string> = {
    "ae-ent": "ae",
    "dae-smec": "ae",

    "ats-ent": "ats",

    "ssp-ent": "ssp",

    "se-ent": "se",
    "dse-smec": "se",

    "ce-ent": "ce",
    "dce-smec": "ce",

    "csam-ces": "csam",
    "csa-ces": "csa",

    "sm-mgr": "manager",
  };

export function getApiRoleId(
  roleId: string,
): string {
  return (
    legacyToApiRoleMap[
      roleId.trim().toLowerCase()
    ] ?? roleId
  );
}*/