"use server";

import { initDataType } from "./types/types";
import { parseTelegramInitData } from "./utils/tools";
import { DataPayload } from './interfaces/addData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function signupUser(initData: string): Promise<initDataType> {
    const data = parseTelegramInitData(initData);
    const response = await fetch(
      `${API_BASE_URL}/users/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Telegram-Init-Data" : initData
        },
        body: JSON.stringify(data),
      }
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  }

  export async function GetUserPhoto(initData: initDataType): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ initData: initData }),
      }
    );
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  }
  
  /**
   * send data encrypted to backend for storage
   */
  export async function storageEncryptedData(data: DataPayload , initData: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/users/passwords`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Init-Data" : initData
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  
    return await response.json();
  }
  