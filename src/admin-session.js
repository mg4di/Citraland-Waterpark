let adminDemoAccessGranted = false;

export function grantAdminDemoAccess() {
  adminDemoAccessGranted = true;
}

export function hasAdminDemoAccess() {
  return adminDemoAccessGranted;
}
