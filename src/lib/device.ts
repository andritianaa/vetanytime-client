// lib/device.ts
import { UAParser } from 'ua-parser-js';

export async function getDeviceInfo(clientAgent: string, ip: string) {
  const parser = new UAParser()
  parser.setUA(clientAgent)

  const device = parser.getDevice()
  const os = parser.getOS()
  const browser = parser.getBrowser()

  // Rest of the code remains the same
  const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`)
  const geoData = await geoResponse.json()

  let deviceModel = device.model || ""

  if (os.name === "iOS") {
    deviceModel = detectiOSModel(clientAgent)
  }

  if (os.name === "Android") {
    deviceModel = detectAndroidModel(clientAgent)
  }

  return {
    deviceType: device.type || "desktop",
    deviceOs: os.name || "Unknown",
    deviceModel,
    browser: browser.name || "Unknown",
    browserVersion: browser.version || "Unknown",
    ip,
    country: geoData.country_name || "Unknown",
  }
}

// Rest of the file remains unchanged

function detectiOSModel(clientAgent: string): string {
  const models: { [key: string]: string } = {
    "iPhone14,2": "iPhone 13 Pro",
    "iPhone14,3": "iPhone 13 Pro Max",
    "iPhone14,4": "iPhone 13 mini",
    "iPhone14,5": "iPhone 13",
    // Ajouter d'autres modèles au besoin
  }

  const match = clientAgent.match(/iPhone(\d+,\d+)/)
  return match ? models[match[0]] || match[0] : "iPhone"
}

function detectAndroidModel(clientAgent: string): string {
  const match = clientAgent.match(/\((.+?)\)/)
  if (!match) return "Android Device"

  const deviceInfo = match[1].split(";")
  return (
    deviceInfo
      .find(
        (info) =>
          info.includes("SM-") || // Samsung
          info.includes("Pixel") || // Google
          info.includes("OnePlus"), // OnePlus
      )
      ?.trim() || "Android Device"
  )
}
