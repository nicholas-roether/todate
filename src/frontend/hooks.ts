import React, { useCallback } from "react";

function usePrev<T>(value: T): T | null {
	const valueRef = React.useRef<T>();
	React.useEffect(() => {
		valueRef.current = value;
	}, [value]);
	return valueRef.current ?? null;
}

function useOngoingTouchesRef(): [
	touchesRef: React.RefObject<React.Touch[]>,
	onTouchStart: React.EventHandler<React.TouchEvent>,
	onTouchEnd: React.EventHandler<React.TouchEvent>
] {
	const touchesRef = React.useRef<React.Touch[]>([]);
	const onTouchStart = useCallback((evt: React.TouchEvent) => {
		Array.from(evt.changedTouches).forEach((touch) =>
			touchesRef.current.push(touch)
		);
	}, []);
	const onTouchEnd = useCallback((evt: React.TouchEvent) => {
		Array.from(evt.changedTouches).forEach((touch) =>
			touchesRef.current.splice(
				touchesRef.current.findIndex(
					(currentTouch) =>
						currentTouch.identifier === touch.identifier
				)
			)
		);
	}, []);
	return [touchesRef, onTouchStart, onTouchEnd];
}

export { usePrev, useOngoingTouchesRef };
