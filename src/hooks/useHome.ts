import { useEffect, useState } from "react";
import { GetMyData } from "../apiService";
import { useUser } from "../context/UserContext";
import { DataItem } from "../types/types";
import Swal from "sweetalert2";

export default function useHome() {
  const { initDataRaw } = useUser();
  const [myData, setMyData] = useState<DataItem[]>([]);

  const fetchData = async () => {
    try {
      const data = await GetMyData(initDataRaw!);
      setMyData(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { myData };
}
