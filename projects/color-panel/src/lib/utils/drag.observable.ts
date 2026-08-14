import { fromEvent, map, merge, Observable, of, startWith, switchMap, takeUntil } from 'rxjs';

export const drag$ = (dragContainer: HTMLElement, options?: {
  initial: { top: number, left: number },
}) => {
  const initial$ = of(options?.initial ?? { left: 0, top: 0 });

  return merge(
    initial$,
    fromEvent<MouseEvent>(dragContainer, 'mousedown').pipe(
      switchMap((mouseDownEvent) => {
        mouseDownEvent.preventDefault();
        mouseDownEvent.stopPropagation();

        return fromEvent<MouseEvent>(document, 'mousemove').pipe(
          startWith(mouseDownEvent),
          map(event => ({ top: event.clientY, left: event.clientX })),
          takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
        );
      }),
    )
  )
};