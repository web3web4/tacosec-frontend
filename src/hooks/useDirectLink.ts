import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '@/context';
import { DataItem, SharedWithMyDataType, TabType } from '@/types/types';

export default function useDirectLink() {
  const { directLinkData, setDirectLinkData } = useUser();
  const location = useLocation();
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleDirectLink = (
    myData: DataItem[],
    sharedWithMyData: SharedWithMyDataType[],
    toggleExpand: (value: string, id: string) => Promise<void>
  ) => {
    if (directLinkData) {
      const element = itemRefs.current[directLinkData.secretId];
      if (element) {
        let pass;
        if (directLinkData.tabName === "shared") {
          pass = sharedWithMyData
            .flatMap(item => item.passwords)
            .find(p => p.id === directLinkData.secretId);
        } else {
          pass = myData.find(p => p.id === directLinkData.secretId);
        }

        if (pass) {
          toggleExpand(pass.value, pass.id);
        }

        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight");
          setTimeout(() => {
            element.classList.remove("highlight");
            // Clear the direct link data once handled to avoid re-triggering
            if (!directLinkData.ChildId) setDirectLinkData(null);
          }, 500);
        }, 1000);
      }
    }
  };

  const handleDirectLinkForChildren = (
    myData: DataItem[],
    sharedWithMyData: SharedWithMyDataType[],
    activeTab: TabType,
    toggleChildExpand: (value: string, childId: string) => Promise<void>
  ) => {
    if (!directLinkData || !directLinkData.ChildId) return;
    const targetId = directLinkData?.ChildId;
    if (!targetId) return;
    const element = itemRefs.current[targetId];
    if (element) {
      let pass;
      if (activeTab === "mydata") {
        pass = myData.find(p => p.id === directLinkData.secretId)
          ?.children?.find(e => e._id === targetId);

      } else {
        pass = sharedWithMyData
          .flatMap(item => item.passwords)
          .find(p => p.id === directLinkData.secretId)
          ?.children?.find(e => e._id === targetId);
      }

      if (pass) {
        toggleChildExpand(pass.value, pass._id);
      }

      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight");
        setTimeout(() => {
          element.classList.remove("highlight");
          // Clear the direct link data once handled to avoid re-triggering
          setDirectLinkData(null);
        }, 500);
      }, 1000);
    }
  };

  return {
    itemRefs,
    handleDirectLink,
    handleDirectLinkForChildren,
  };
}
