type SharedLockType = 'LOCK' | 'EMPTY';

let sharedLock: SharedLockType = 'EMPTY';

const TaskQueue: (() => void)[] = [];

export function SimpleLock(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    return new Promise((resolve, reject) => {
      const execute = async () => {
        if (sharedLock === 'LOCK') {
          TaskQueue.push(execute);
          return;
        }
        sharedLock = 'LOCK';

        try {
          const result = await originalMethod.apply(this, args);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          sharedLock = 'EMPTY';
          if (TaskQueue.length > 0) {
            const next = TaskQueue.shift();
            next?.();
          }
        }
      };

      execute();
    });
  };

  return descriptor;
}
