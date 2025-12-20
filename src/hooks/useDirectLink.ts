import { useRef } from 'react';
import { useUser, useSnackbar } from '@/context';
import { DataItem, SharedWithMyDataType, TabType } from '@/types/types';

export default function useDirectLink() {
  const { directLinkData, setDirectLinkData } = useUser();
  const { showSnackbar } = useSnackbar();
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const processingRef = useRef<string | null>(null);

  const handleDirectLink = (
    myData: DataItem[],
    sharedWithMyData: SharedWithMyDataType[],
    toggleExpand: (value: string, id: string, isIgnored: boolean) => Promise<void>
  ) => {
    if (directLinkData && processingRef.current !== directLinkData.secretId) {
      const currentId = directLinkData.secretId;
      const element = itemRefs.current[currentId];
      
      if (element) {
        processingRef.current = currentId;
        const currentData = { ...directLinkData };
        
        // Clear data immediately to prevent re-triggering
        if (!currentData.ChildId) {
          setDirectLinkData(null);
        }

        let pass;
        if (currentData.tabName === "shared") {
          pass = sharedWithMyData
            .flatMap(item => item.passwords)
            .find(p => p.id === currentId);
        } else {
          pass = myData.find(p => p.id === currentId);
        }

        if (pass) {
          toggleExpand(pass.value, pass.id, true);
        }

        // Use requestAnimationFrame or a very short timeout for the scroll
        // to ensure it happens after the toggle state has been processed
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("highlight");
          setTimeout(() => {
            element.classList.remove("highlight");
            processingRef.current = null;
          }, 1000);
        }, 100);
      } else {
        // Element not found, likely deleted or not in this tab
        showSnackbar("Secret not found or deleted");
        setDirectLinkData(null);
      }
    }
  };

  const handleDirectLinkForChildren = (
    myData: DataItem[],
    sharedWithMyData: SharedWithMyDataType[],
    activeTab: TabType,
    toggleChildExpand: (value: string, childId: string, isIgnored: boolean) => Promise<void>
  ) => {
    if (!directLinkData || !directLinkData.ChildId || processingRef.current === directLinkData.ChildId) return;
    
    const targetId = directLinkData.ChildId;
    const element = itemRefs.current[targetId];
    
    if (element) {
      processingRef.current = targetId;
      
      // Clear data immediately
      setDirectLinkData(null);

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
        toggleChildExpand(pass.value, pass._id, true);
      }

      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("highlight");
        setTimeout(() => {
          element.classList.remove("highlight");
          processingRef.current = null;
        }, 1000);
      }, 100);
    } else {
      // Child element not found
      showSnackbar("Secret not found or deleted");
      setDirectLinkData(null);
    }
  };

  return {
    itemRefs,
    handleDirectLink,
    handleDirectLinkForChildren,
  };
}
