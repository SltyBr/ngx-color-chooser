import {
  fromEvent,
  map,
  merge,
  of,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';

export const drag$ = (
  dragContainer: HTMLElement,
  initials?: { topCoef: number; leftCoef: number },
) => {
  let containerRect = dragContainer.getBoundingClientRect();
  const initials$ = of({
    top: (initials?.topCoef || 0) * containerRect.height,
    left: (initials?.leftCoef || 0) * containerRect.width,
    containerRect,
  });
  
  const startEvent$ = merge(
    fromEvent<MouseEvent>(dragContainer, 'mousedown'),
    fromEvent<TouchEvent>(dragContainer, 'touchstart'),
  );

  const moveEvent$ = merge(
    fromEvent<TouchEvent>(document, 'touchmove'),
    fromEvent<MouseEvent>(document, 'mousemove'),
  );

  const endEvent$ = merge(
    fromEvent<TouchEvent>(document, 'touchend'),
    fromEvent<MouseEvent>(document, 'mouseup'),
  )

  return merge(
    initials$.pipe(
      map((data) => ({
        left: Math.min(data.left, containerRect.width),
        top: Math.min(data.top, containerRect.height),
        containerRect,
      })),
    ),
    startEvent$.pipe(
      switchMap((startEvent) => {
        containerRect = dragContainer.getBoundingClientRect();

        startEvent.preventDefault();
        startEvent.stopPropagation();

        return moveEvent$.pipe(
          startWith(startEvent),
          map(moveEvent => {
            if (moveEvent instanceof TouchEvent) {
              const { clientX, clientY } = moveEvent.touches[0];

              return { clientX, clientY };
            }

            return { clientX: moveEvent.clientX, clientY: moveEvent.clientY };
          }),
          map(({ clientX, clientY }) => ({
            left: Math.max(
              0,
              Math.min(
                containerRect.width,
                clientX - containerRect.left,
              ),
            ),
            top: Math.max(
              0,
              Math.min(
                containerRect.height,
                clientY - containerRect.top,
              ),
            ),
            containerRect,
          })
        ),
        takeUntil(endEvent$),
        );
      }),
    ),
  );
};
