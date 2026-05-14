import { prisma } from '../../../lib/prisma';
import { withAdmin } from '../../../lib/authMiddleware';

async function handler() {
  try {
    const result = await prisma.user.deleteMany({});
    return Response.json({
      success: true,
      message: `Deleted ${result.count} users from the database`
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export const DELETE = withAdmin(handler);
