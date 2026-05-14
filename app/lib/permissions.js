// lib/permissions.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export const PERMISSIONS = {
  ADMIN: {
    users: {
      create: true,
      read: true,
      update: true,
      delete: true,
      block: true,
    },
    products: {
      create: true,
      read: true,
      update: true,
      delete: true,
    },
    orders: {
      read: true,
      update: true,
      delete: true,
      view_all: true,
    },
    analytics: {
      read: true,
      export: true,
    },
    settings: {
      manage: true,
    },
  },
  USER: {
    users: {
      create: false,
      read: true,
      update: true,
      delete: false,
      block: false,
    },
    products: {
      create: false,
      read: true,
      update: false,
      delete: false,
    },
    orders: {
      read: true,
      update: false,
      delete: false,
      view_all: false,
    },
    analytics: {
      read: false,
      export: false,
    },
    settings: {
      manage: false,
    },
  },
  BLOCKED: {
    users: { create: false, read: false, update: false, delete: false, block: false },
    products: { create: false, read: false, update: false, delete: false },
    orders: { read: false, update: false, delete: false, view_all: false },
    analytics: { read: false, export: false },
    settings: { manage: false },
  },
};

/**
 * Get all permissions for a specific role
 * @param {string} role - User role (ADMIN, USER, BLOCKED)
 * @returns {object} Permission object
 */
export function getPermissions(role) {
  return PERMISSIONS[role] || PERMISSIONS.BLOCKED;
}

/**
 * Check if a role has a specific permission
 * @param {string} role - User role
 * @param {string} resource - Resource name (users, products, orders, etc.)
 * @param {string} action - Action (create, read, update, delete, etc.)
 * @returns {boolean} Whether permission is granted
 */
export function hasPermission(role, resource, action) {
  const permissions = getPermissions(role);
  return permissions?.[resource]?.[action] === true;
}

/**
 * Check multiple permissions at once
 * @param {string} role - User role
 * @param {array} checks - Array of {resource, action} objects
 * @returns {boolean} True if user has ALL permissions
 */
export function hasAllPermissions(role, checks) {
  return checks.every(({ resource, action }) =>
    hasPermission(role, resource, action)
  );
}

/**
 * Check if user has ANY of the given permissions
 * @param {string} role - User role
 * @param {array} checks - Array of {resource, action} objects
 * @returns {boolean} True if user has ANY permission
 */
export function hasAnyPermission(role, checks) {
  return checks.some(({ resource, action }) =>
    hasPermission(role, resource, action)
  );
}


/**
 * Middleware to protect API routes
 * @param {string} resource - Resource to protect
 * @param {string} action - Action to check
 * @returns {function} Middleware function
 */
export function requirePermission(resource, action) {
  return (handler) => {
    return async (request, context) => {
      const session = await getServerSession(authOptions);
      const userRole = session?.user?.role;

      if (!userRole || !hasPermission(userRole, resource, action)) {
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return handler(request, context);
    };
  };
}

/**
 * Guard function for client-side route protection
 * @param {string} role - User role
 * @param {string} resource - Resource
 * @param {string} action - Action
 * @returns {boolean} Whether to allow access
 */
export function canAccess(role, resource, action) {
  return hasPermission(role, resource, action);
}

/**
 * Get all allowed actions for a role on a resource
 * @param {string} role - User role
 * @param {string} resource - Resource name
 * @returns {array} Array of allowed actions
 */
export function getAllowedActions(role, resource) {
  const permissions = getPermissions(role);
  const resourcePerms = permissions?.[resource] || {};
  return Object.keys(resourcePerms).filter(action => resourcePerms[action] === true);
}
