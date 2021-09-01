import React from "react";

function usePrev<T>(value: T): T | null {
	const valueRef = React.useRef<T>();
	React.useEffect(() => {
		valueRef.current = value;
	}, [value]);
	return valueRef.current ?? null;
}

export { usePrev };
