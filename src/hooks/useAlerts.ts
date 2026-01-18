import { AlertsDetails, AlertsType, TabType } from "@/types";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { getAlerts } from "@/services";
import { formatRelativeDate, stripHtml } from "@/utils";
import { useUser } from "@/context";

export default function useAlerts() {
  const navigate = useNavigate();
  const { initDataRaw } = useUser();
  const { setDirectLinkData } = useUser();
  const [data, setData] = useState<AlertsType>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Pull to refresh state
  const [pullStartY, setPullStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async (page: number = 1) => {
    try {
      const response = await getAlerts(initDataRaw, page);
      return response;
    } catch (error) {
      console.error("Error fetching alerts:", error);
      throw error;
    }
  }, [initDataRaw]);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchData(1);
        setData(response);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [fetchData]);

  const loadMoreAlerts = useCallback(async () => {
    if (!data?.pagination.hasNextPage || isFetchingMore) return;

    try {
      setIsFetchingMore(true);
      const nextPage = currentPage + 1;
      const response = await fetchData(nextPage);
      
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
  }, [data?.pagination.hasNextPage, isFetchingMore, currentPage, fetchData]);

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.currentTarget as HTMLElement;
    if (target && target.scrollTop === 0 && !isRefreshing && !isLoading) {
      setPullStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing || isLoading) return;
    
    const target = e.currentTarget as HTMLElement;
    if (target && target.scrollTop === 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - pullStartY;
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 120));
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    
    if (pullDistance > 80 && !isRefreshing && !isLoading) {
      setIsRefreshing(true);
      
      try {
        const response = await fetchData(1);
        setData(response);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error refreshing alerts:", error);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
    
    setPullStartY(0);
  };

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

  const getTabIcon = (tabName: TabType) => {
    return tabName === "shared" ? "📨" : "🔒";
  };

  const getDateText = (createdAt: string) => formatRelativeDate(createdAt);

  const getPlainTextMessage = (htmlMessage: string) => stripHtml(htmlMessage);

  const isClickable = (type: string) => {
    return type !== "report_notification";
  };

  const handleClick = (item: AlertsDetails) => {
    if(item.type === "report_notification") return;
    
    setIsNavigating(true);
    
    // Small delay to show loading state before navigation
    setTimeout(() => {
      navigate("/");
      setDirectLinkData({
        secretId: item.parentId ? item.parentId : item.relatedEntityId,
        tabName: item.tabName,
        ChildId: item.parentId ? item.relatedEntityId : null,
      });
      setIsNavigating(false);
    }, 100);
  };

  return {
    data,
    isLoading,
    isFetchingMore,
    isNavigating,
    isRefreshing,
    isPulling,
    pullDistance,
    getTabLabel,
    getTabIcon,
    getDateText,
    getPlainTextMessage,
    isClickable,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    observerTarget
  };
}
