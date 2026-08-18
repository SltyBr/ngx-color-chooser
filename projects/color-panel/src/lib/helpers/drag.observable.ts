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
  handlerRect: DOMRect,
  initials?: { top: number; left: number },
) => {
  let containerRect = dragContainer.getBoundingClientRect();
  const initials$ = of({
    top: initials?.top || 0,
    left: initials?.left || 0,
    containerRect,
  });

  return merge(
    initials$.pipe(
      map((data) => ({
        left: Math.min(data.left, containerRect.width - handlerRect.width),
        top: Math.min(data.top, containerRect.height - handlerRect.height),
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
          map((event) => ({
            left: Math.max(
              0,
              Math.min(
                containerRect.width - handlerRect.width,
                event.clientX - containerRect.left - handlerRect.width / 2,
              ),
            ),
            top: Math.max(
              0,
              Math.min(
                containerRect.height - handlerRect.height,
                event.clientY - containerRect.top - handlerRect.height / 2,
              ),
            ),
            containerRect,
          })),
          distinctUntilChanged(
            (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
          ),
          takeUntil(fromEvent<MouseEvent>(document, 'mouseup')),
        );
      }),
    ),
  );
};
