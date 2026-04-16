/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import type { AxiosPromise } from "axios";

const useFetchData = (
  apiCallFn: () => AxiosPromise<any> | Promise<any>,
  deps: any = [],
  options: {
    enabled?: boolean;
  } = { enabled: true }
) => {
  const [loading, setLoading] = useState(true);
  const [errored, setError] = useState(false);
  const [data, setData] = useState<any>({});
  const fetchData = async () => {
    try {
      const response = await apiCallFn();
      setData(response.data || response);
      setError(false);
      setLoading(false);
    } catch (error: any) {
      setData(error?.response?.data);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (options.enabled) {
      fetchData();
    }
  }, [...deps, options.enabled]);

  return [loading, errored, data, fetchData];
};

export default useFetchData;
