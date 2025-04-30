import { useEffect, useState } from "react";
import { GetMyData } from "../apiService";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { DataItem, TabType } from "../types/types";
import Swal from "sweetalert2";

export default function useHome() {
  const navigate = useNavigate();
  const { initDataRaw } = useUser();
  const [data, setData] = useState<DataItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");


  const handleAddClick = (): void => {
    navigate("/add");
  };

  const handlesetActiveTabClick = (tabActive: TabType): void => {
    setData([]);
    tabActive === "mydata" ? fetchMyData() : fetchSharedData();
    setActiveTab(tabActive);
  };

  const fetchMyData = async () => {
    try {
      const data = await GetMyData(initDataRaw!);
      setData(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const fetchSharedData = async () => {
    try {
      // const data = await GetMyData(initDataRaw!);
      const data = [{ key: "test" , value: "test", sharedWith: []}];
      setData(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  useEffect(() => {
    fetchMyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, activeTab, handleAddClick, handlesetActiveTabClick };
}
