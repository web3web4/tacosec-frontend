"use server";

import { UserProfileDetailsType, initDataType } from "./types/types";
import { parseTelegramInitData } from "./utils/tools";
import { DataPayload } from "./interfaces/addData";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function signupUser(initData: string): Promise<initDataType> {
  const data = parseTelegramInitData(initData);
  const response = await fetch(`${API_BASE_URL}/users/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function GetMyData(initData: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/passwords`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * send data encrypted to backend for storage
 */
export async function storageEncryptedData(
  data: DataPayload,
  initData: string
): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/passwords`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Telegram-Init-Data": initData,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

export async function getUserProfileDetails(username: string): Promise<UserProfileDetailsType | null> {
  const response = await fetch(
    `${API_BASE_URL}/users/telegram/profile?username=${username}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const html = await response.text();
  // Check if the response contains this class, the user does not exist
  const tgDownloadLink = html.includes("tl_main_download_link tl_main_download_link_ios");
  // Also Check if the response contains this class, the user does not exist
  const tgIconUser = html.includes("tgme_icon_user");
  if (tgDownloadLink || tgIconUser) return null;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const imgEl = doc.querySelector(".tgme_page_photo_image") as HTMLImageElement | null;
  const nameEl = doc.querySelector(".tgme_page_title span") as HTMLElement | null;
  const img = imgEl ? { src: imgEl.src } : null;
  const name = nameEl?.textContent?.trim() ?? "";
  const finalUsername = username.startsWith("@") ? username.substring(1) : username;
  const res: UserProfileDetailsType = {img: img, name: name, username: finalUsername};
  return res;
}
