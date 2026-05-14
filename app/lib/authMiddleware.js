// lib/authMiddleware.js

import { NextResponse } from 'next/server';
import { hasPermission } from './permissions';

import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

/**
 * Verify user is authenticated
 * @param {object} request - Next.js request object
 * @returns {object|null} Decoded token or null
 */
export async function getAuthUser(request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) return null;

  return { 
    userId: session.user.id, 
    role: session.user.role 
  };
}

/**
 * Middleware to require authentication
 * @param {function} handler - Route handler
 * @returns {function} Protected handler
 */
export function withAuth(handler) {
  return async (request, context) => {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add user to context
    request.user = user;
    return handler(request, context);
  };
}

/**
 * Middleware to require specific permission
 * @param {string} resource - Resource to protect
 * @param {string} action - Action to check
 * @param {function} handler - Route handler
 * @returns {function} Protected handler
 */
export function withPermission(resource, action, handler) {
  return async (request, context) => {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!hasPermission(user.role, resource, action)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    request.user = user;
    return handler(request, context);
  };
}

/**
 * Middleware to require admin role
 * @param {function} handler - Route handler
 * @returns {function} Protected handler
 */
export function withAdmin(handler) {
  return async (request, context) => {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    request.user = user;
    return handler(request, context);
  };
}

// Example usage in API routes:
/*
// pages/api/products.js
import { withPermission } from '@/lib/authMiddleware';

const handler = async (request) => {
  const { user } = request;
  return NextResponse.json({ success: true, user });
};

export default withPermission('products', 'read', handler);
*/

// Example for React components:
/*
// components/AdminPanel.jsx
import { useAuth } from '@/hooks/useAuth';
import { canAccess } from '@/lib/permissions';

export default function AdminPanel() {
  const { user } = useAuth();
  
  if (!canAccess(user.role, 'settings', 'manage')) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Settings</div>;
}
*/
