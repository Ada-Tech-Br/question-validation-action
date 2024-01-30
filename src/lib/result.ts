type OkResult<T> = {
  ok: true
  value: T
};

type ErrResult<E> = { ok: false; error: E }
export type Result<T, E = undefined> = OkResult<T> | ErrResult<E>

export const Ok = <T>(data: T): OkResult<T> => {
  return { ok: true, value: data } as const
}

export const Err = <E>(error: E): ErrResult<E> => {
  return { ok: false, error } as const
}
