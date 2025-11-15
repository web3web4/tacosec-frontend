import { AlertsDetails, AlertsType, TabType } from "@/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAlerts } from "@/apiService";
import { formatDate } from "@/utils";
import { useUser } from "@/context";

export default function useAlerts() {
  const navigate = useNavigate();
  const { initDataRaw } = useUser();
  const { setDirectLinkData } = useUser();
  const [data, setData] = useState<AlertsType>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const response = await getAlerts(initDataRaw, 1);
        setData(response);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [initDataRaw]);

  const getTabLabel = (tabName: TabType) => {
    return tabName === "shared" ? "sh" : "m";
  };

  const getDateText = (createdAt: string) => formatDate(createdAt);

  const handleClick = (item: AlertsDetails) => {
    navigate("/");
    setDirectLinkData({
      secretId: item.secretId,
      tabName: item.tabName,
      ChildId: item.ChildId || null,
    });
  };

  return {
    data,
    isLoading,
    getTabLabel,
    getDateText,
    handleClick
  };
}
