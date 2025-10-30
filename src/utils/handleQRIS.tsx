// ✅ CRC16/CCITT-FALSE calculation
function crc16ccitt(str: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * ✅ Generate a QRIS payload (with correct rupiah amount)
 * @param baseQris - Static Merchant ID (e.g. ID10254493976740303UMI)
 * @param amount - Amount in rupiah (e.g. 3000)
 */
export default function handleQRIS(baseQris: string, amount: number) {
  if (!baseQris || amount <= 0) throw new Error("Missing QRIS or invalid amount");

  // Convert to string and remove decimals if any
  const amountStr = Math.round(amount).toString();

  // Tag 54: "54" + length(2 digits) + value
  const amountField = `54${amountStr.length.toString().padStart(2, "0")}${amountStr}`;

  const payload =
    "000201" + // Payload format
    "010212" + // Dynamic QR
    "26610014COM.GO-JEK.WWW" + // Merchant acquirer
    "01189360091439145952940210G9145952940303UMI" + // Merchant account info
    "51440014ID.CO.QRIS.WWW" +
    "0215" + baseQris +
    "52040000" + // Merchant category
    "5303360" + // Currency code (IDR)
    amountField + // 💰 Correctly formatted amount
    "5802ID" +
    "5921Toko Ci Ali, GRGL PTM" +
    "6013JAKARTA BARAT" +
    "610511460" +
    "62070703A01";

  const crc = crc16ccitt(payload + "6304");
  return payload + "6304" + crc;
}
