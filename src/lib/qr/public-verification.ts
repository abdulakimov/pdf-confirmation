import "server-only";

import QRCode from "qrcode";

const DEFAULT_PUBLIC_APP_URL = "http://localhost:3000";

function getAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_PUBLIC_APP_URL).replace(/\/+$/, "");
}

export function getPublicVerificationUrl(publicToken: string) {
  return `${getAppUrl()}/verify/${publicToken}`;
}

export async function generatePublicVerificationQrSvg(publicToken: string) {
  return QRCode.toString(getPublicVerificationUrl(publicToken), {
    errorCorrectionLevel: "M",
    margin: 1,
    type: "svg",
    width: 256
  });
}