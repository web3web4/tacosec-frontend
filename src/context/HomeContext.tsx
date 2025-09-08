import { getDataSharedWithMy, getUserProfileDetails, hidePassword, deletePassword, GetMyData, reportUser, getChildrenForSecret, setSecretView, getSecretViews } from "@/apiService";
import { DataItem, Report, ReportsResponse, ReportType, SharedWithMyDataType, TabType, UserProfileDetailsType, SecretViews, ViewDetails } from "@/types/types";
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useWallet } from "@/wallet/walletContext";
import { fromHexString } from "@nucypher/shared";
import { MetroSwal, formatDate } from "@/utils";
import { fromBytes } from "@nucypher/taco";
import { noUserImage } from "@/assets";
import { useUser } from "@/context";
import { useTaco } from "@/hooks";


const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;

interface HomeContextType {
  myData: DataItem[];
  sharedWithMyData: SharedWithMyDataType[];
  activeTab: TabType;
  isLoading: boolean;
  handleAddClick: () => void;
  handleSetActiveTabClick: (tabActive: TabType) => void;
  handleDelete: (id: string, isHasSharedWith: boolean) => Promise<void>;
  handleReportUser: (secretId: string, reportedUsername: string) => Promise<void>;
  handleViewReportsForSecret: (data: ReportsResponse[], secretKey: string) => Promise<void>;
  triggerGetChildrenForSecret: (id: string) => void;
  handleGetSecretViews: (e: any, id: string) => void;
  handleDirectLink: () => void;
  handleDirectLinkForChildren: () => void;
  isInit: boolean;
  provider: any;
  userData: any;
  decrypting: boolean;
  decryptedMessages: Record<string, string>;
  decryptErrors: Record<string, string>;
  toggleExpand: (value: string, id: string) => Promise<void>;
  expandedId: string | null;
  toggleChildExpand: (value: string, childId: string) => void;
  expandedChildId: string | null;
  decryptingChild: boolean;
  decryptedChildMessages: Record<string, string>;
  authError: string | null;
  secretViews: Record<string, SecretViews>;
  itemRefs: React.RefObject<{ [key: string]: HTMLDivElement | null }>;
}

const HomeContext = createContext<HomeContextType | null>(null);

export function HomeProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [myData, setMyData] = useState<DataItem[]>([]);
  const [sharedWithMyData, setSharedWithMyData] = useState<SharedWithMyDataType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<string, string>>({});
  const [decryptErrors, setDecryptErrors] = useState<{ [id: string]: string }>({});
  const [decrypting, setDecrypting] = useState<boolean>(false);
  const [expandedChildId, setExpandedChildId] = useState<string | null>(null);
  const [decryptedChildMessages, setDecryptedChildMessages] = useState<Record<string, string>>({});
  const [secretViews, setSecretViews] = useState<Record<string, SecretViews>>({});
  const [decryptingChild, setDecryptingChild] = useState<boolean>(false);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [previousPath, setPreviousPath] = useState<string>("");
  const { signer, provider } = useWallet();
  const { initDataRaw, userData, directLinkData } = useUser();
  const { isInit, decryptDataFromBytes } = useTaco({
    domain,
    provider,
    ritualId,
  });

  const handleAddClick = (): void => {
    navigate("/add");
  };

  const handleSetActiveTabClick = (tabActive: TabType): void => {
    setMyData([]);
    setExpandedId(null);
    setExpandedChildId(null);
    tabActive === "mydata" ? fetchMyData() : fetchSharedWithMyData();
    setActiveTab(tabActive);
  };

  const fetchMyData = async () => {
    try {
      // Pass initDataRaw which might be null for web login
      setIsLoading(true);
      const response = await GetMyData(initDataRaw || undefined);
      const data: DataItem[] = response.map((item: any) => ({
        id: item._id, 
        key: item.key,
        value: item.value,
        sharedWith: item.sharedWith,
        createdAt: item.createdAt,
      }));
      setMyData(data);
      if(data.length > 0) getProfilesDetailsForUsers(data);
      setAuthError(null); // Clear any previous auth errors on success
    } catch (err) {
      console.error("Error fetching data:", err);
      if (err instanceof Error && err.message.includes("Authentication")) {
        setAuthError(err.message);
        // Only show error alert for non-authentication errors or if we're not in Telegram
        if (!window.Telegram?.WebApp) {
          MetroSwal.fire({
            icon: "error",
            title: "Authentication Error",
            text: err.message,
          });
        }
      } else {
        MetroSwal.fire({
          icon: "error",
          title: "Error",
          text: err instanceof Error ? err.message : "An error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilesDetailsForUsers = async (data: DataItem[]) => {
    try{
      const enrichedData: DataItem[] = await Promise.all(
        data.map(async (item) => {
          const userDetails = await Promise.all(
            item.sharedWith.map(async (user) => {
              const profile = await getUserProfileDetails(user.username);

              if (profile && (!profile.img || !profile.img.src || profile.img.src.trim() === "")) {
                return {
                  ...profile,
                  img: { src: noUserImage },
                };
              }
  
              return profile;
            })
          );
  
          const filteredDetails = userDetails.filter(
            (profile): profile is UserProfileDetailsType => profile !== null
          );
  
          return {
            ...item,
            shareWithDetails: filteredDetails,
          };
        })
      );

      setMyData(enrichedData);
    } catch (error) {
      console.log(error);
    }
  };
  
  const fetchSharedWithMyData = async () => {
    try {
      setIsLoading(true);
      const data = await getDataSharedWithMy(initDataRaw || undefined);
      setSharedWithMyData(data.sharedWithMe);
      if(data.sharedWithMe.length > 0) getProfilesDetailsForUsersSharedBy(data.sharedWithMe);
      setAuthError(null); // Clear any previous auth errors on success
    } catch (err) {
      console.error("Error fetching shared data:", err);
      if (err instanceof Error && err.message.includes("Authentication")) {
        setAuthError(err.message);
        // Only show error alert for non-authentication errors or if we're not in Telegram
        if (!window.Telegram?.WebApp) {
          MetroSwal.fire({
            icon: "error",
            title: "Authentication Error",
            text: err.message,
          });
        }
      } else {
        MetroSwal.fire({
          icon: "error",
          title: "Error",
          text: err instanceof Error ? err.message : "An error occurred",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getProfilesDetailsForUsersSharedBy = async (data: SharedWithMyDataType[]) => {
    const enrichedData = await Promise.all(
      data.map(async (item) => {
        const profile = await getUserProfileDetails(item.username);
        
        if (!profile) return item;
  
        const profileWithDefaultImg = {
          ...profile,
          img: profile.img ?? { src: noUserImage},
        };
  
        return {
          ...item,
          sharedByDetails: profileWithDefaultImg,
        };
      })
    );
    setSharedWithMyData(enrichedData);
  };
  

  useEffect(() => {
    if (directLinkData) {
      handleSetActiveTabClick(directLinkData.tabName);
    } else {
      fetchMyData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (location.pathname === '/' && (previousPath === '/add' || previousPath === '/settings')) {
      handleSetActiveTabClick(activeTab);
    }
    
    // Update previous path
    setPreviousPath(location.pathname);
  }, [location.pathname]); 
 
  const handleDelete = async (id: string, isHasSharedWith: boolean) => {
    const MetroSwalOptions: any = {
      title: 'Do you want to delete this Secret?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: `var(--primary-color)`
    };
    
    if (isHasSharedWith) {
      MetroSwalOptions.input = 'checkbox';
      MetroSwalOptions.inputPlaceholder = 'Also delete for everyone it was shared with';
    }
  
    const result = await MetroSwal.fire(MetroSwalOptions);
    if (result.isConfirmed) {
      try {
        if (isHasSharedWith) {
          const alsoDeleteForEveryone = result.value === 1;
          alsoDeleteForEveryone ? 
            await deletePassword(initDataRaw || ""  , id ) : 
            await hidePassword(initDataRaw || ""  , id);
        } else {
          await deletePassword(initDataRaw || "" , id);
        }
        setMyData((prev) => prev.filter((secret) => secret.id !== id));
      } catch (error) {
        MetroSwal.fire({
          icon: 'error',
          title: 'Delete Secret Error',
          text: error instanceof Error ? error.message : "An error occurred",
        });
      }
    }
  };

  const handleReportUser = async (secretId: string, reportedUsername: string) => {
    // Set default report type
    let selectedReportType: ReportType = 'Other';

    const reportTypes = [
      { type: 'Security', icon: '🔒' },
      { type: 'Abuse', icon: '⚠️' },
      { type: 'Spam', icon: '🚫' },
      { type: 'Other', icon: '📝', isPrimary: true }
    ];
  
    const buttonsHtml = reportTypes.map(rt => {
      const isPrimary = rt.isPrimary ? `
        background: var(--primary-color); border: 1.5px solid var(--primary-color);
        transform: scale(1.05); box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        color: white;
      ` : `
        background: #f8f9fa; border: 1.5px solid #e9ecef;
        color: #495057;
      `;
    
      return `
        <button type="button" class="report-type-btn" data-type="${rt.type}" style="
          ${isPrimary}
          border-radius: 12px; padding: 12px 6px; cursor: pointer;
          transition: all 0.2s ease; display: flex; flex-direction: column;
          align-items: center; justify-content: center; min-height: 70px; position: relative;
        ">
          <div style="font-size: 24px; margin-bottom: 4px;">${rt.icon}</div>
          <div style="font-size: 10px; font-weight: 500; text-align: center; line-height: 1.2;">
            ${rt.type}
          </div>
        </button>
      `;
    }).join('');
    
    
    const result = await MetroSwal.fire({
      title: 'Report Issue',
      html: `
          <div style="margin-bottom: 16px;">
            <div style="margin-bottom: 12px; font-weight: 600; color: #333; font-size: 14px; text-align: center;">
              Select report type:
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; max-width: 280px; margin-left: auto; margin-right: auto;">
              ${buttonsHtml}
            </div>
          </div>
          <textarea id="report-message" placeholder="Describe the issue in detail..." style="
            width: 100%; height: 100px; padding: 12px; border: 1.5px solid #e9ecef;
            border-radius: 8px; font-family: inherit; font-size: 14px; resize: vertical;
            box-sizing: border-box; background: #f8f9fa; outline: none;
          " aria-label="Type your message here" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='#e9ecef'"></textarea>
        `,
      showCancelButton: true,
      confirmButtonText: 'Submit Report',
      cancelButtonText: 'Cancel',
      confirmButtonColor: 'var(--primary-color)',
      width: '500px',
      didOpen: () => {
        const buttons = document.querySelectorAll('.report-type-btn');
        
        buttons.forEach(btn => {
          btn.addEventListener('click', function(this: HTMLElement) {
            // Reset all buttons
            buttons.forEach(b => {
              const button = b as HTMLElement;
              button.style.borderColor = '#e9ecef';
              button.style.background = '#f8f9fa';
              button.style.transform = 'scale(1)';
              button.style.boxShadow = 'none';
              const iconDiv = button.querySelector('div:first-child') as HTMLElement;
              const textDiv = button.querySelector('div:last-child') as HTMLElement;
              if (iconDiv) iconDiv.style.filter = 'none';
              if (textDiv) textDiv.style.color = '#495057';
            });
            
            // Style selected button
            const currentBtn = this;
            currentBtn.style.borderColor = 'var(--primary-color)';
            currentBtn.style.background = 'var(--primary-color)';
            currentBtn.style.transform = 'scale(1.05)';
            currentBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
            const iconDiv = currentBtn.querySelector('div:first-child') as HTMLElement;
            const textDiv = currentBtn.querySelector('div:last-child') as HTMLElement;
            if (iconDiv) iconDiv.style.filter = 'brightness(1.2)';
            if (textDiv) textDiv.style.color = 'white';
            
            const type = currentBtn.getAttribute('data-type') as ReportType;
            selectedReportType = type;
          });
        });
      },
      preConfirm: () => {
        const message = (document.getElementById('report-message') as HTMLTextAreaElement)?.value;
        
        if (!selectedReportType) {
          return MetroSwal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please select a report type!'
          });
          return false;
        }
        
        if (!message || message.trim().length < 8) {
          return MetroSwal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Please provide at least 8 characters describing the issue!'
          });
          return false;
        }
        
        return {
          type: selectedReportType,
          reason: message.trim()
        };
      }
    });

    if (result.isConfirmed && result.value) {
      selectedReportType = result.value.type as ReportType;
      const message: string = result.value.reason;
      
      // Create report object with proper typing
      const newReport: Report = {
        secret_id: secretId,
        report_type: selectedReportType,
        reason: message,
        reportedUsername: reportedUsername,
      };
      
      try {
        await reportUser(initDataRaw!, newReport);
        const rep: ReportsResponse = {
          id: "",
          createdAt: new Date().toISOString(),
          reason: newReport.reason as ReportType,
          report_type: newReport.report_type,
          reporterUsername: userData?.username!,
        };

        setSharedWithMyData((prevData) =>
          prevData.map((item) => ({
            ...item,
            passwords: item.passwords.map((pass) => {
              if (pass.id === secretId) {
                return {
                  ...pass,
                  reports: [...pass.reports, rep],
                };
              }
              return pass;
            }),
          }))
        );
        MetroSwal.fire({
          icon: 'success',
          title: 'Report Submitted',
          text: `Your ${selectedReportType} report has been submitted successfully and will be reviewed by our team.`,
          confirmButtonColor: 'var(--primary-color)'
        });
      } catch(error) {
        MetroSwal.fire({
          icon: 'error',
          title: 'Report Error',
          text: error instanceof Error ? error.message : "An error occurred",
        });
      }
    }
  }; 

  const handleViewReportsForSecret = async (data: ReportsResponse[], secretKey: string) => {
    if (data.length === 0) {
      MetroSwal.fire({
        icon: 'info',
        title: 'No Reports',
        text: 'No reports found for this secret.',
        confirmButtonColor: 'var(--primary-color)'
      });
      return;
    }

    const getTypeIcon = (type: string) => {
      switch (type) {
        case 'Security': return '🔒';
        case 'Abuse': return '⚠️';
        case 'Spam': return '🚫';
        case 'Other': return '📝';
        default: return '📝';
      }
    };

    const reportsHtml = data.map((report, i) => `
      <div style="border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 8px; text-align: left; background: #f9f9f9;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <span style="font-size: 18px; margin-right: 8px;">${getTypeIcon(report.report_type)}</span>
          <div style="font-weight: bold; color: #333; text-transform: capitalize;">
            ${report.report_type} Report #${i + 1}
          </div>
        </div>
        <div style="color: #555; font-size: 14px; margin-bottom: 12px; line-height: 1.4;">
          ${report.reason}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <div style="color: #666; font-size: 12px;">
            <strong>Reported by:</strong> ${report.reporterUsername}<br>
            <strong>Date:</strong> ${formatDate(report.createdAt)}

          </div>
        </div>
      </div>
    `).join('');

    MetroSwal.fire({
      title: `Reports for ${secretKey} (${data.length} total)`,
      html: `
        <div style="max-height: 400px; overflow-y: auto; padding: 10px;">
          ${reportsHtml}
        </div>
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
          💡 <strong>Tip:</strong> Click outside or press ESC to close this dialog
        </div>
      `,
      width: '700px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'reports-popup'
      }
    });
  };
  // This function is to handle the case of pressing the button of the message that arrived to him as a notification
  const handleDirectLink = () => {
    if(directLinkData){
        const element = itemRefs.current[directLinkData.secretId];
        if (element) {
          let pass;
          if(directLinkData.tabName === "shared"){
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
            }, 500);
          }, 1000);
        }
    }
  };
  
  const handleDirectLinkForChildren = () => {
    if(!directLinkData || !directLinkData.ChildId){ return; }
    const targetId = directLinkData?.ChildId;
    if(!targetId) return;
    const element = itemRefs.current[targetId];
    if (element) {
      let pass;
      if(activeTab === "mydata"){
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
        }, 500);
      }, 1000);
    }
  };

  const toggleExpand = async (value: string, id: string) => {
    setDecrypting(false);
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
  
      if (!decryptedMessages[id]) {
        decryptMessage(id, value);
      }
      await setSecretView(initDataRaw!, id);
      triggerGetChildrenForSecret(id);
      const secretViews = await getSecretViews(initDataRaw!, id);
      setSecretViews((prev) => ({ ...prev, [id]: secretViews }));
    }
  };

  const triggerGetChildrenForSecret = async (id: string) => {
    const response = await getChildrenForSecret(initDataRaw!, id);
    if ("message" in response) { return; }

    const entries = await Promise.all(
      response.map(async (child) => {
        const views = await getSecretViews(initDataRaw!, child._id);
        const hasMyView = views.viewDetails.some(sec => sec.username === userData?.username);
        views.isNewSecret = !hasMyView;
        if(child.username === userData?.username || userData?.privacyMode) views.isNewSecret = false;
        return [child._id, views] as const;
      })
    );

    setSecretViews((prev) => ({
      ...prev,
      ...Object.fromEntries(entries),
    }));
    
    if (activeTab === "mydata") {
        setMyData((prev) => prev.map((item) =>
            item.id === id ? { ...item, children: response } : item ));
      } else {
        setSharedWithMyData((prev) => prev.map((item) => ({ ...item,
            passwords: item.passwords.map((pw) =>
            pw.id === id ? { ...pw, children: response } : pw )}))
        );
      }
  };
  
const decryptMessage = async (id: string, encryptedText: string) => {
  if (!encryptedText || !provider || !signer) return;
  try {
    setDecrypting(true);
    console.log("Decrypting message...");
    const decryptedBytes = await decryptDataFromBytes(
      fromHexString(encryptedText)
    );
    if (decryptedBytes) {
      const decrypted = fromBytes(decryptedBytes);
      setDecryptedMessages((prev) => ({ ...prev, [id]: decrypted }));
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown decryption error";

    console.error("Error decrypting:", errorMessage);

    setDecryptErrors((prev) => ({
      ...prev,
      [id]: errorMessage,
    }));
  } finally {
    setDecrypting(false);
  }
};


  const toggleChildExpand = async (value: string, childId: string) => {
    setDecryptingChild(false);
    await setSecretView(initDataRaw!, childId);
    if (expandedChildId === childId) {
      setExpandedChildId(null);
    } else {
      setExpandedChildId(childId);
      if (!decryptedChildMessages[childId]) {
        decryptChildMessage(childId, value);
      }
    }
  };

  const decryptChildMessage = async (childId: string, encryptedText: string) => {
    if (!encryptedText || !provider || !signer) return;
    try {
      setDecryptingChild(true);
      const decryptedBytes = await decryptDataFromBytes(
        fromHexString(encryptedText)
      );
      if (decryptedBytes) {
        const decrypted = fromBytes(decryptedBytes);
        setDecryptedChildMessages((prev) => ({ ...prev, [childId]: decrypted }));
        if(secretViews[childId].isNewSecret) secretViews[childId].isNewSecret = false;
      }
    } catch (e) {
      console.error("Error decrypting child:", e);
    } finally {
      setDecryptingChild(false);
    }
  };

  const enrichViewDetailsWithImages = async (viewDetails: ViewDetails[]): Promise<ViewDetails[]> => {
    return Promise.all(
      viewDetails.map(async (viewer) => {
        const profile = await getUserProfileDetails(viewer.username);
  
        return {
          ...viewer,
          img: profile && profile.img?.src?.trim()
            ? profile.img.src
            : noUserImage,
        };
      })
    );
  };

  const renderViewer = (viewer: any) => {
    const formattedDate =
      viewer.type === "viewed" && viewer.viewedAt
        ? formatDate(viewer.viewedAt)
        : "";
  
    return `
      <div style="display: flex; align-items: center; padding: 10px; border-bottom: 1px solid #f0f0f0; text-align: left;">
        <div style="width: 40px; height: 40px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-right: 12px;">
          <span style="display: flex; justify-content: space-between;font-size: 16px; color: #666;">
            <img id="viewer-img-${viewer.username}" style="border-radius: 50%" src=${
              viewer.img || noUserImage
            } width=35 height=35 />
          </span>
        </div>
        <div style="flex-grow: 1;">
          <div style="font-weight: 500; margin-bottom: 2px; text-align: left; color: black">
            ${viewer.firstName || ""} ${viewer.lastName || ""}
          </div>
          ${
            formattedDate
              ? `<div style="font-size: 12px; color: #666; text-align: left;">${formattedDate}</div>`
              : ""
          }
        </div>
      </div>
    `;
  };

  const handleGetSecretViews = async (e: any, id: string) => {
    e.stopPropagation();
    const data = secretViews[id];
    
    if (!data || data.viewDetails.length === 0) {
      MetroSwal.fire({
        icon: 'info',
        title: 'No Views',
        text: 'No one has viewed this message yet.',
        confirmButtonColor: 'var(--primary-color)'
      });
      return;
    }
  
    let mergedData: ViewDetails[] = [];
  
    mergedData = [
      ...data.viewDetails.map(user => ({
        telegramId: user.telegramId ?? null,
        username: user.username,
        viewedAt: user.viewedAt ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        img: undefined, 
        type: "viewed"
      })),
    
      ...data.notViewedUsers.map(user => ({
        telegramId: user.telegramId ?? null,
        username: user.username,
        viewedAt: null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        img: undefined,
        type: "not-viewed"
      })),
    
      ...data.unknownUsers.map(user => ({
        telegramId: null,
        username: user.username,
        viewedAt: null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        img: undefined,
        type: "unknown"
      })),
    ];
  
    const sortedViewDetails = [...mergedData].sort((a, b) =>
      new Date(b.viewedAt || 0).getTime() - new Date(a.viewedAt || 0).getTime()
    );
  
    const viewed = sortedViewDetails.filter(v => v.type === "viewed");
    const notViewed = sortedViewDetails.filter(v => v.type === "not-viewed");
    const unknown = sortedViewDetails.filter(v => v.type === "unknown");

    const viewedHtml = viewed.length
    ? `<h4 style="margin: 15px 0 10px 13px;font-size: 15px;text-align:left; color: #000000c2">Decrypted by:</h4>
        ${viewed.map(renderViewer).join("")}`
    : "";

    const notViewedHtml = notViewed.length
    ? `<h4 style="margin: 10px 0 10px 13px;font-size: 15px;text-align:left; color: #000000c2">Not Decrypted:</h4>
        ${notViewed.map(renderViewer).join("")}`
    : "";

    const unknownHtml = unknown.length
    ? `<h4 style="margin: 10px 0 10px 13px;font-size: 15px;text-align:left; color: #000000c2">Unknown:</h4>
        ${unknown.map(renderViewer).join("")}`
    : "";

    MetroSwal.fire({
    title: ``,
    html: `
      <div style="max-height: 300px; overflow-y: auto; margin: -20px -24px 0; border-radius: 12px;">
        ${viewedHtml}
        ${notViewedHtml}
        ${unknownHtml}
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
    customClass: {
      popup: "viewers-popup",
      title: "viewers-title",
      closeButton: "viewers-close",
    },
    width: "350px",
    didOpen: () => {
      const title = document.querySelector(".viewers-title") as HTMLElement;
      const close = document.querySelector(".viewers-close") as HTMLElement;
      if (title) {
        title.style.marginTop = "15px";
        close.style.marginTop = "5px";
        close.style.marginRight = "15px";
      }
    },
    });
  
    try {
      if (!data) return;
      const updatedViewDetails = await enrichViewDetailsWithImages(sortedViewDetails);
  
      updatedViewDetails.forEach((viewer, index) => {
        const imgEl = document.querySelector(`#viewer-img-${viewer.username}`) as HTMLImageElement;
        if (imgEl) imgEl.src = viewer.img || noUserImage;
      });
    } catch (error) {
      console.error(error);
    }
  };
  

  const value = {
    myData, 
    sharedWithMyData, 
    activeTab, 
    handleAddClick, 
    handleSetActiveTabClick, 
    handleDelete, 
    handleReportUser, 
    handleViewReportsForSecret, 
    triggerGetChildrenForSecret,
    handleGetSecretViews,
    handleDirectLink,
    handleDirectLinkForChildren,
    isInit, 
    provider, 
    userData, 
    decrypting, 
    decryptedMessages,
    decryptErrors, 
    toggleExpand, 
    expandedId, 
    toggleChildExpand, 
    expandedChildId, 
    decryptingChild, 
    decryptedChildMessages,
    isLoading,
    authError,
    secretViews,
    itemRefs
  };

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome() {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
}