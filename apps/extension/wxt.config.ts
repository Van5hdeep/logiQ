import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "wxt";

export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  vite: () => ({ plugins: [tailwindcss()] }),
  manifest: {
    name: "logiQ",
    description: "Explains any LeetCode, Codeforces or CodeChef problem and saves it to your logiQ vault.",
    // Public key only: pins the extension id (hfflkpmhfebkhdgbagopjkmkelgoaobo) so the web app can reach it.
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnWh3HC85YX5X8F6cXFWmr0JaZhl7f73Svp4Up956umIdAAFTXuP8aPTdXXdJRCLs/KsdwNO3c9zMs1luAcxND55lzaBDEcpiMCxc0qMhnPd8QgrHD56g4kHJv7urFWHl+AzABsna8TNPbxITd+k2JsOVbgHhO1GUPTudo+ehd5XE7Q6ygVYR16RCMm1Emdj2Be+zHfCq+VlfnwSCgxwc87Brgzb+UtLqgiEXpU0ZkBYGQILD+AjkNoY5T3nMu95alRcG62KC7ZYKf8YsZ+hxb514EG1LD7x4hyxcf6a52TSw4tyeUKRcpreYWOWTYxAiHdSoPWR/p8lYx0TNsUq49QIDAQAB",
    permissions: ["sidePanel", "storage", "tabs", "scripting", "activeTab"],
    host_permissions: [
      "https://leetcode.com/*",
      "https://codeforces.com/*",
      "https://www.codechef.com/*",
      "http://localhost:3000/*",
    ],
    action: { default_title: "Open logiQ (Alt+L)" },
    commands: {
      _execute_action: {
        suggested_key: { default: "Alt+L" },
        description: "Open the logiQ side panel",
      },
    },
    externally_connectable: { matches: ["http://localhost:3000/*"] },
  },
});
