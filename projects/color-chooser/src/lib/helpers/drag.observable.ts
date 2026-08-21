import {
  distinctUntilChanged,
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

  return merge(
    initials$.pipe(
      map((data) => ({
        left: Math.min(data.left, containerRect.width),
        top: Math.min(data.top, containerRect.height),
        containerRect,
      })),
    ),
    fromEvent<MouseEvent>(dragContainer, 'mousedown').pipe(
      switchMap((mouseDownEvent) => {
        containerRect = dragContainer.getBoundingClientRect();

        mouseDownEvent.preventDefault();
        mouseDownEvent.stopPropagation();

        return fromEvent<MouseEvent>(document, 'mousemove').pipe(
          startWith(mouseDownEvent),
          map((event) => {
            return {
              left: Math.max(
                0,
                Math.min(
                  containerRect.width,
                  event.clientX - containerRect.left,
                ),
              ),
              top: Math.max(
                0,
                Math.min(
                  containerRect.height,
                  event.clientY - containerRect.top,
                ),
              ),
              containerRect,
            }
          }),
          distinctUntilChanged(
            (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
          ),
          takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
        );
      }),
    ),
  );
};
