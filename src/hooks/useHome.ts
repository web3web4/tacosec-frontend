import { useEffect, useState } from "react";
import { getDataSharedWithMy, getUserProfileDetails, hidePassword, deletePassword, GetMyData, reportUser, getChildrenForSecret } from "../apiService";
import defaultProfileImage from "../assets/images/no-User.png";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { DataItem, Report, ReportsResponse, ReportType, ChildDataItem, SharedWithMyDataType, TabType, UserProfileDetailsType } from "../types/types";
import Swal from "sweetalert2";
import { useWallet } from "../wallet/walletContext";
import useTaco from "./useTaco";
import { fromHexString } from "@nucypher/shared";
import { fromBytes } from "@nucypher/taco";

const ritualId = process.env.REACT_APP_TACO_RITUAL_ID as unknown as number;
const domain = process.env.REACT_APP_TACO_DOMAIN as string;

export default function useHome() {
  const navigate = useNavigate();
  const [myData, setMyData] = useState<DataItem[]>([]);
  const [sharedWithMyData, setSharedWithMyData] = useState<SharedWithMyDataType[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("mydata");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});
  const [decrypting, setDecrypting] = useState<boolean>(false);
  const [expandedChildIndex, setExpandedChildIndex] = useState<Record<number, number | null>>({});
  const [decryptedChildMessages, setDecryptedChildMessages] = useState<Record<string, string>>({});
  const [decryptingChild, setDecryptingChild] = useState<boolean>(false);
  const { signer, provider } = useWallet();
  const { initDataRaw, userData } = useUser();
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
    tabActive === "mydata" ? fetchMyData() : fetchSharedWithMyData();
    setActiveTab(tabActive);
  };

  const fetchMyData = async () => {
    try {
      const response = await GetMyData(initDataRaw!);
      const data: DataItem[] = response.map((item: any) => ({
        id: item._id, 
        key: item.key,
        value: item.value,
        sharedWith: item.sharedWith,
      }));
      setMyData(data);
      if(data.length > 0) await getProfilesDetailsForUsers(data);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
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
                  img: { src: defaultProfileImage },
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
      const data = await getDataSharedWithMy(initDataRaw!);
      setSharedWithMyData(data.sharedWithMe);
      if(data.sharedWithMe.length > 0) await getProfilesDetailsForUsersSharedBy(data.sharedWithMe);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "An error occurred",
      });
    }
  };

  const getProfilesDetailsForUsersSharedBy = async (data: SharedWithMyDataType[]) => {
    const enrichedData = await Promise.all(
      data.map(async (item) => {
        const profile = await getUserProfileDetails(item.username);
        
        if (!profile) return item;
  
        const profileWithDefaultImg = {
          ...profile,
          img: profile.img ?? { src: defaultProfileImage},
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
    fetchMyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, isHasSharedWith: boolean) => {
    const swalOptions: any = {
      title: 'Do you want to delete this Secret?',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: `var(--primary-color)`
    };
    
    if (isHasSharedWith) {
      swalOptions.input = 'checkbox';
      swalOptions.inputPlaceholder = 'Also delete for everyone it was shared with';
    }
  
    const result = await Swal.fire(swalOptions);
    if (result.isConfirmed) {
      try {
        if (isHasSharedWith) {
          const alsoDeleteForEveryone = result.value === 1;
          alsoDeleteForEveryone ? deletePassword(initDataRaw!, id) : hidePassword(initDataRaw!, id);
        } else {
          deletePassword(initDataRaw!, id);
        }
        setMyData((prev) => prev.filter((secret) => secret.id !== id));
      } catch (error) {
        Swal.fire({
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
    
    
    const result = await Swal.fire({
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
          Swal.showValidationMessage('Please select a report type!');
          return false;
        }
        
        if (!message || message.trim().length < 8) {
          Swal.showValidationMessage('Please provide at least 8 characters describing the issue!');
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
        Swal.fire({
          icon: 'success',
          title: 'Report Submitted',
          text: `Your ${selectedReportType} report has been submitted successfully and will be reviewed by our team.`,
          confirmButtonColor: 'var(--primary-color)'
        });
      } catch(error) {
        Swal.fire({
          icon: 'error',
          title: 'Report Error',
          text: error instanceof Error ? error.message : "An error occurred",
        });
      }
    }
  }; 

  const handleViewReportsForSecret = async (data: ReportsResponse[], secretKey: string) => {
    if (data.length === 0) {
      Swal.fire({
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
            <strong>Date:</strong> ${new Date(report.createdAt).toLocaleDateString('en-GB')}

          </div>
        </div>
      </div>
    `).join('');

    Swal.fire({
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
 
  const toggleExpand = async (index: number, value: string, id: string) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
  
      if (!decryptedMessages[index]) {
        decryptMessage(index, value);
      }
  
      const response: ChildDataItem[] = await getChildrenForSecret(initDataRaw!, id);
      if (activeTab === "mydata") {
        setMyData((prev) => prev.map((item) =>
            item.id === id ? { ...item, children: response } : item ));
      } else {
        setSharedWithMyData((prev) => prev.map((item) => ({ ...item,
            passwords: item.passwords.map((pw) =>
            pw.id === id ? { ...pw, children: response } : pw )}))
        );
      }
    }
  };
  
  
  const decryptMessage = async (index: number, encryptedText: string) => {
    if (!encryptedText || !provider || !signer) return;
    try {
      setDecrypting(true);
      console.log("Decrypting message...");
      const decryptedBytes = await decryptDataFromBytes(
        fromHexString(encryptedText)
      );
      if (decryptedBytes) {
        const decrypted = fromBytes(decryptedBytes);
        setDecryptedMessages((prev) => ({ ...prev, [index]: decrypted }));
      }
    } catch (e) {
      console.error("Error decrypting:", e);
    } finally {
      setDecrypting(false);
    }
  };

  const toggleChildExpand = (parentIndex: number, childIndex: number, value: string, childId: string) => {
    const currentChild = expandedChildIndex[parentIndex];
    if (currentChild === childIndex) {
      setExpandedChildIndex(prev => ({ ...prev, [parentIndex]: null }));
    } else {
      setExpandedChildIndex(prev => ({ ...prev, [parentIndex]: childIndex }));
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
      }
    } catch (e) {
      console.error("Error decrypting child:", e);
    } finally {
      setDecryptingChild(false);
    }
  };

  return { myData, sharedWithMyData, activeTab, handleAddClick, handleSetActiveTabClick, handleDelete, handleReportUser, handleViewReportsForSecret, isInit, provider, userData, decrypting, decryptedMessages, toggleExpand, expandedIndex, toggleChildExpand, expandedChildIndex, decryptingChild, decryptedChildMessages };
}
