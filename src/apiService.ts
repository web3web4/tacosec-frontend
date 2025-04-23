"use server";

import { initDataType } from "./types/types";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function verifyUser(initData: string): Promise<initDataType> {
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