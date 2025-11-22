import { AlertsDetails, AlertsType, TabType } from "@/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { getAlerts } from "@/apiService";
import { formatDate } from "@/utils";
import { useUser } from "@/context";

export default function useAlerts() {
  const navigate = useNavigate();
  const { initDataRaw } = useUser();
  const { setDirectLinkData } = useUser();
  const [data, setData] = useState<AlertsType>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const observerTarget = useRef<HTMLDivElement>(null);

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

  const loadMoreAlerts = useCallback(async () => {
    if (!data?.pagination.hasNextPage || isFetchingMore) return;

    try {
      setIsFetchingMore(true);
      const nextPage = currentPage + 1;
      const response = await getAlerts(initDataRaw, nextPage);
      
      setData((prevData) => {
        if (!prevData) return response;
        
        return {
          notifications: [...prevData.notifications, ...response.notifications],
          pagination: response.pagination
        };
      });
      
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("Error loading more alerts:", error);
    } finally {
      setIsFetchingMore(false);
    }
  }, [data?.pagination.hasNextPage, isFetchingMore, currentPage, initDataRaw]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && data?.pagination.hasNextPage) {
          loadMoreAlerts();
        }
      },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreAlerts, data?.pagination.hasNextPage]);

  const getTabLabel = (tabName: TabType) => {
    return tabName === "shared" ? "sh" : "m";
  };

  const getDateText = (createdAt: string) => formatDate(createdAt);

  const handleClick = (item: AlertsDetails) => {
    navigate("/");
    setDirectLinkData({
      secretId: item.parentId ? item.parentId : item.relatedEntityId,
      tabName: item.tabName,
      ChildId: item.parentId ? item.relatedEntityId : null,
    });
  };

  return {
    data,
    isLoading,
    isFetchingMore,
    getTabLabel,
    getDateText,
    handleClick,
    observerTarget
  };
}
