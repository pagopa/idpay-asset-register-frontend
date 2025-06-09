export type Permission = {
  name: string;
  description: string;
  mode: string;
};

export const permission2PermissionModel = (resources: Permission) => ({
  name: resources.name,
  description: resources.description,
  mode: resources.mode,
});
