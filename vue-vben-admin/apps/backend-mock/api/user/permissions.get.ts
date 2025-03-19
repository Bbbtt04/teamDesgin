import { prisma } from '~/modules/db';
import { verifyAccessToken } from '~/utils/jwt-utils';
import { unAuthorizedResponse } from '~/utils/response';

export default eventHandler(async (event) => {
  const userinfo = verifyAccessToken(event);
  if (!userinfo) {
    return unAuthorizedResponse(event);
  }

  // 获取用户的所有权限
  const userPermissions = await prisma.permission.findMany({
    where: {
      rolePermissions: {
        some: {
          role: {
            userRoles: {
              some: {
                userId: userinfo.id, // 假设 userinfo 中有用户 ID
              },
            },
          },
        },
      },
    },
  });

  console.log(userPermissions);

  return useResponseSuccess(userPermissions);
});
