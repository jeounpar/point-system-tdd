### 동시성 제어

```typescript
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
```

```typescript
@UserLock
public async usePoint({ userId, amount } : {userId: number; amount: number;}): Promise<UserPoint> 
```

```typescript
@UserLock
public async chargePoint({ userId, amount } : {userId: number; amount: number;}): Promise<UserPoint> 
```

### TestCode
```typescript
it('3명의 유저에게 각각 500포인트를 충전하고 100포인트를 사용하는 6개의 요청(총 18개)을 동시에 처리한다.', async () => {
    const userA: number = 1;
    const userB: number = 2;
    const userC: number = 3;

    await Promise.all([
      service.chargePoint({ userId: userA, amount: 500 }),
      service.chargePoint({ userId: userB, amount: 500 }),
      service.chargePoint({ userId: userC, amount: 500 }),
    ]);

    try {
      await Promise.allSettled([
        ...Array.from({ length: 6 }, () =>
          service.usePoint({ userId: userA, amount: 100 }),
        ),
        ...Array.from({ length: 6 }, () =>
          service.usePoint({ userId: userB, amount: 100 }),
        ),
        ...Array.from({ length: 6 }, () =>
          service.usePoint({ userId: userC, amount: 100 }),
        ),
      ]);
    } catch (error) {}

    const [userPoint_A, userPoint_B, userPoint_C] = await Promise.all([
      service.fetchUserPoint({ userId: userA }),
      service.fetchUserPoint({ userId: userB }),
      service.fetchUserPoint({ userId: userC }),
    ]);

    expect(userPoint_A.point).toEqual(0);
    expect(userPoint_B.point).toEqual(0);
    expect(userPoint_C.point).toEqual(0);
  });
```

최대 10개의 UserId를 처리할 수 있는 LockPool을 만들어 처리하는 방법을 사용했습니다.

`@UserLock` 데코레이터가 붙어있는 메서드는 userId에 해당하는 Lock을 획득하고 메서드가 리턴되거나 에러를 떨구는 경우 Lock을 해제하고 LockPool에서 제거합니다.

데코레이터를 사용한 메서드는 메서드가 끝날때 까지 해당 userId에 대해 포인트충전/포인트사용에 대해 동시성을 제어할 수 있는 권한을 획득하고 한번에 하나씩 처리할 수 있게 됩니다.

### 문제점
데코레이터 필수 사용의 번거로움
- UserPoint의 상태를 변경하는 메서드마다 @UserLock 데코레이터를 붙여야 하며, 이를 누락할 경우 동시성 문제가 발생할 가능성이 있습니다.
- 데코레이터의 사용이 개발자의 실수로 인해 Lock 관리가 누락될 수 있습니다.

Lock 점유 시간:
- @UserLock 데코레이터가 Service Layer에서 Lock을 관리하기 때문에, 외부 API 호출 또는 시간이 오래 걸리는 로직이 포함된 메서드에서 Lock을 점유한 상태로 대기하게 됩니다.
- 이로 인해 동일 userId에 대한 다른 요청들이 지연되는 문제가 발생할 수 있습니다.

### 해결방안

Lock Pool 구현
- 기존 UserLockMap을 Repository Layer로 이동
- 데이터베이스 수준에서 동시성을 제어하며 Lock을 Repository 내부에서만 사용

Lock 점유 흐름 변경
- Service Layer는 비즈니스 로직을 처리하고, Repository Layer에 상태 변경 요청만 전달
- Repository Layer에서 데이터 상태를 변경할 때만 Lock을 점유하여 빠르게 작업을 처리하고 해제
