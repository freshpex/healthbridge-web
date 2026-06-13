import { useEffect, useState } from "react";

export const useResponsivePageSize = () => {
  const readSize = () => (window.matchMedia("(max-width: 720px)").matches ? 5 : 10);
  const [pageSize, setPageSize] = useState(readSize);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 720px)");
    const update = () => setPageSize(readSize());
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return pageSize;
};
