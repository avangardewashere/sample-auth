// "use client";

import TelegramAuth from "@/components/TelegramAuth";
import { getSession } from "@/utlis/session";
// import { useEffect, useState } from "react";

// interface UserData {
//   id: number;
//   first_name?: string;
//   last_name?: string;
//   username?: string;
//   language_code?: string;
//   is_premium?: boolean;
// }

export default  async function Home() {
  // const [userData, setUserData] = useState<UserData | null>(null);

  // useEffect(() => {
  //   import("@twa-dev/sdk")
  //     .then((mod) => {
  //       const WebApp = mod.default;
  //       if (WebApp.initDataUnsafe.user) {
  //         setUserData(WebApp.initDataUnsafe.user as UserData);
  //       }
  //     })
  //     .catch((error) => {
  //       console.error("Error loading WebApp SDK", error);
  //     });
  // }, []);

  const session = await getSession();

  return (
    <main className="p-6 flex min-h-screen flex-col items-center justify-center p-24">
      {/* {userData ? (
        <>
          <h1 className="text-2xl font-bold mb-4">User Data</h1>
          <ul>
            <li>ID: {userData.id}</li>
            <li>First Name: {userData.first_name}</li>
            <li>Last Name: {userData.last_name}</li>
            <li>Username: {userData.username}</li>
          </ul>
        </>
      ) : (
        <div>Loading...</div>
      )} */}

      <h1 className="text-4xl font-bold mb-8">JWT authentication for Telegram Mini</h1>
      <pre>{JSON.stringify(session,null,2)}</pre>
      <TelegramAuth />

      
    </main>
  );
}
