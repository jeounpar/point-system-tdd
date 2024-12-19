type SharedLockType = 'LOCK' | 'EMPTY';

interface LockManager {
  lockState: SharedLockType;
  taskQueue: (() => void)[];
}

const UserLockMap = new Map<number, LockManager>();
const MAX_USERS = 10;

export function UserLock(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function ({
    userId,
    ...args
  }: {
    userId: number;
    [key: string]: any;
  }) {
    if (!UserLockMap.has(userId)) {
      if (UserLockMap.size >= MAX_USERS) {
        throw new Error('Maximum number of user locks exceeded.');
      }
      UserLockMap.set(userId, { lockState: 'EMPTY', taskQueue: [] });
    }

    const userLock = UserLockMap.get(userId);
    if (!userLock) {
      throw new Error('Failed to initialize user lock.');
    }

    return new Promise((resolve, reject) => {
      const execute = async () => {
        if (userLock.lockState === 'LOCK') {
          userLock.taskQueue.push(execute);
          return;
        }
        userLock.lockState = 'LOCK';

        try {
          const result = await originalMethod.apply(this, [
            { userId, ...args },
          ]);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          userLock.lockState = 'EMPTY';
          if (userLock.taskQueue.length > 0) {
            const next = userLock.taskQueue.shift();
            next?.();
          }

          if (userLock.taskQueue.length === 0) {
            UserLockMap.delete(userId);
          }
        }
      };

      execute();
    });
  };

  return descriptor;
}
