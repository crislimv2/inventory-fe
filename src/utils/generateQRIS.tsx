function pad(value: string, size: number) {
  return value.padStart(size, '0');
}

function crc16(str: string) {
  let crc = 0xFFFF;
  for (const c of str) {
    crc ^= c.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
      crc &= 0xFFFF;
    }
  }
  return pad(crc.toString(16).toUpperCase(), 4);
}


export const generateDynamicQRIS = (amount: number) => {
    console.log("Generating QRIS for amount:", amount);
  const payloadFormatIndicator = "000201";
  const pointOfInitiationMethod = "010212"; // dynamic
  const merchantAccountInfo = "26610014COM.GO-JEK.WWW01189360091439145952940210G9145952940303UMI";
  const merchantCategoryCode = "52045499";
  const transactionCurrency = "5303360"; // correct
  const amountStr = amount.toString();
  const transactionAmount = `54${pad(amountStr.length.toString(), 2)}${amountStr}`;
  const countryCode = "5802ID";
  const merchantName = "5921Toko Ci Ali, GRGL PTM";
  const merchantCity = "6013JAKARTA BARAT";
  const postalCode = "610511460"; // already correct actually 👍
  const randomRef = Math.random().toString(36).substring(2, 10).toUpperCase();
  const refId = `A220${new Date().toISOString().slice(2,10).replace(/-/g,"")}${randomRef}`;
  const additionalData = `62${pad((`010${pad(refId.length.toString(),2)}${refId}`).length.toString(), 2)}010${pad(refId.length.toString(),2)}${refId}`;

  
  // Combine all before CRC
  const raw = payloadFormatIndicator + pointOfInitiationMethod +
    merchantAccountInfo + "51440014ID.CO.QRIS.WWW0215ID10254493976740303UMI" +
    merchantCategoryCode + transactionCurrency + transactionAmount +
    countryCode + merchantName + merchantCity + postalCode + additionalData + "63" + "04";

  const crc = crc16(raw);

  return raw + crc;
};
