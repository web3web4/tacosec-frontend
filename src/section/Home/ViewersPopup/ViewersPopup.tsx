import { getUserProfileDetails } from "@/apiService";
import { UserDisplayToggle, SheetModal } from "@/components";
import { useEffect, useCallback } from "react";
import { ViewersPopupProps } from "@/types";
import { ViewDetails } from "@/types/types";
import { noUserImage } from "@/assets";
import { formatDate } from "@/utils";
import "./ViewersPopup.css";

export default function ViewersPopup({
  showViewersPopup,
  setShowViewersPopup,
  secretViews
}: ViewersPopupProps) {

  const enrichViewDetailsWithImages = async (viewDetails: ViewDetails[]): Promise<ViewDetails[]> => {
    return Promise.all(
      viewDetails.map(async (viewer) => {
        try {
          if (viewer.username) {
            const userProfile = await getUserProfileDetails(viewer.username);
            return {
              ...viewer,
              img: userProfile && userProfile.img?.src.trim()
                ? userProfile.img.src
                : noUserImage
            };
          }
          return viewer;
        } catch (error) {
          console.error(`Failed to fetch image for ${viewer.username}:`, error);
          return viewer;
        }
      })
    );
  };

  const renderViewer = (viewer: ViewDetails) => {
    console.log(viewer)
    const formattedDate =
      viewer.type === "viewed" && viewer.viewedAt
        ? formatDate(viewer.viewedAt)
        : "";

    return (
      <div key={`${viewer.username}-${viewer.publicAddress}`} className="viewer-item">
        <div className="viewer-avatar">
          <img
            id={`viewer-img-${viewer.username}`}
            src={viewer.img || noUserImage}
            alt={`${viewer.firstName || ''} ${viewer.lastName || ''}`}
            width={35}
            height={35}
          />
        </div>
        <div className="viewer-info">
          <div className="viewer-name">
            <UserDisplayToggle userData={viewer} />
          </div>
          {formattedDate && (
            <div className="viewer-date">{formattedDate}</div>
          )}
        </div>
      </div>
    );
  };

  const createMergedData = useCallback((): ViewDetails[] => {
    if (!secretViews) return [];

    return [
      ...secretViews.viewDetails.map(user => ({
        telegramId: user.telegramId ?? null,
        username: user.username,
        viewedAt: user.viewedAt ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        publicAddress: user.publicAddress,
        img: undefined,
        type: "viewed" as const
      })),

      ...secretViews.notViewedUsers.map(user => ({
        telegramId: user.telegramId ?? null,
        username: user.username,
        viewedAt: null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        publicAddress: user.publicAddress,
        img: undefined,
        type: "not-viewed" as const
      })),

      ...secretViews.unknownUsers.map(user => ({
        telegramId: null,
        username: user.username,
        viewedAt: null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        publicAddress: user.publicAddress,
        img: undefined,
        type: "unknown" as const
      })),
    ];
  }, [secretViews]);

  useEffect(() => {
    if (showViewersPopup && secretViews) {
      const loadImages = async () => {
        try {
          const mergedData = createMergedData();
          const sortedViewDetails = [...mergedData].sort((a, b) =>
            new Date(b.viewedAt || 0).getTime() - new Date(a.viewedAt || 0).getTime()
          );

          const updatedViewDetails = await enrichViewDetailsWithImages(sortedViewDetails);

          updatedViewDetails.forEach((viewer) => {

            const imgEl = document.querySelector(`#viewer-img-${viewer.username}`) as HTMLImageElement;
            if (imgEl) imgEl.src = viewer.img || noUserImage;
          });
        } catch (error) {
          console.error(error);
        }
      };

      loadImages();
    }
  }, [showViewersPopup, secretViews, createMergedData]);

  if (!secretViews) return null;

  const mergedData = createMergedData();

  const sortedViewDetails = [...mergedData].sort((a, b) =>
    new Date(b.viewedAt || 0).getTime() - new Date(a.viewedAt || 0).getTime()
  );

  const viewed = sortedViewDetails.filter(v => v.type === "viewed");
  const notViewed = sortedViewDetails.filter(v => v.type === "not-viewed");
  const unknown = sortedViewDetails.filter(v => v.type === "unknown");

  return (
    <SheetModal
      open={showViewersPopup}
      onClose={() => setShowViewersPopup(false)}
      title="Secret Views"
    >
      <div className="viewers-popup">
        <div className="viewers-content">
          {viewed.length > 0 && (
            <div className="viewers-section">
              <h4 className="viewers-section-title">Decrypted by:</h4>
              <div className="viewers-list">
                {viewed.map(renderViewer)}
              </div>
            </div>
          )}

          {notViewed.length > 0 && (
            <div className="viewers-section">
              <h4 className="viewers-section-title">Not Decrypted:</h4>
              <div className="viewers-list">
                {notViewed.map(renderViewer)}
              </div>
            </div>
          )}

          {unknown.length > 0 && (
            <div className="viewers-section">
              <h4 className="viewers-section-title">Unknown:</h4>
              <div className="viewers-list">
                {unknown.map(renderViewer)}
              </div>
            </div>
          )}
        </div>
      </div>
    </SheetModal>
  );
}