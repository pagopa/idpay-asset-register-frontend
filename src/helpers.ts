/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */
export const copyTextToClipboard = (magicLink: string | undefined) => {
  if (typeof magicLink === 'string') {
    void navigator.clipboard.writeText(magicLink);
  }
};
/*
export const downloadQRCode = (selector: string, trxCode: string | undefined) => {
  const content = document.getElementById(selector);
  if (content !== null) {
    content.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgData = content.outerHTML;
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    const fileName = `${trxCode}_qr_code.svg`;
    downloadLink.download = fileName;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }
};
*/
export const downloadQRCodeFromURL = (url: string | undefined) => {
  if (typeof url === 'string') {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const link = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = link;
        const fileName = 'qrcode.png';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch((error) => console.log(error));
  }
};

export const mapDataForDiscoutTimeRecap = (
  trxExpirationSeconds: number | undefined,
  trxDate: Date | undefined
) => {
  let expirationDays;
  let expirationDate;
  let expirationTime;
  if (typeof trxExpirationSeconds === 'number' && typeof trxDate === 'object') {
    const initialTimestamp = trxDate.getTime();
    trxDate.setSeconds(trxDate.getSeconds() + trxExpirationSeconds);
    const finalTimestamp = trxDate.getTime();
    expirationDays = Math.trunc((finalTimestamp - initialTimestamp) / (1000 * 60 * 60 * 24));
    const expDateStrArr = trxDate
      .toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Europe/Rome',
        hour: 'numeric',
        minute: 'numeric',
      })
      .split(', ');
    expirationDate = expDateStrArr[0];
    expirationTime = expDateStrArr[1];
  }
  return { expirationDays, expirationDate, expirationTime };
};

export const formattedCurrency = (
  number: number | undefined,
  symbol: string = '-',
  cents: boolean = false
) => {
  if (number && cents === false) {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(number);
  } else if (number && cents === true) {
    const roundedNumberStr = number.toFixed(2);
    const roundedNumber = parseFloat(roundedNumberStr) / 100;
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(
      roundedNumber
    );
  }
  return symbol;
};

export const formatIban = (iban: string | undefined) => {
  if (iban) {
    return `${iban.slice(0, 2)} ${iban.slice(2, 4)} ${iban.slice(4, 5)} ${iban.slice(
      5,
      10
    )} ${iban.slice(10, 15)} ${iban.slice(15, 32)}`;
  }
  return '';
};

export const formatDate = (date: Date | undefined) => {
  if (date) {
    return date.toLocaleString('fr-BE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'Europe/Rome',
      hour: 'numeric',
      minute: 'numeric',
    });
  }
  return '';
};

export const formatFileName = (name: string | undefined): string => {
    if (typeof name === 'string' && name.length > 15) {
        const nameArr = name.split('.');
        const fileExtension = nameArr[nameArr.length - 1];
        const truncatedName = name.substring(0, 10);
        return `${truncatedName}... .${fileExtension}`;
    } else if (typeof name === 'string' && name.length <= 15) {
        return name;
    }
    return '';
};

export const initUploadBoxStyle = {
    gridColumn: 'span 12',
    alignItems: 'center',
    justifyItems: 'center',
    width: '100%',
    border: '1px dashed #0073E6',
    borderRadius: '10px',
    backgroundColor: 'rgba(0, 115, 230, 0.08)',
    p: 3,
};

export const initUploadHelperBoxStyle = {
    gridColumn: 'span 12',
    alignItems: 'center',
    justifyItems: 'start',
    width: '100%',
    py: 1,
    px: 3,
};