import {PRODUCTS_CATEGORIES, DEBUG_CONSOLE} from "../../utils/constants";
import {CsvDTO} from "../../api/generated/register/CsvDTO";

export const categoryList = [
     {
        label: "commons.categories.refrigeratingappl",
        value: PRODUCTS_CATEGORIES.REFRIGERATINGAPPL
    },
    {
        label: "commons.categories.tumbledryers",
        value: PRODUCTS_CATEGORIES.TUMBLEDRYERS
    },
    {
        label: "commons.categories.rangehoods",
        value: PRODUCTS_CATEGORIES.RANGEHOODS
    },
    {
        label: "commons.categories.ovens",
        value: PRODUCTS_CATEGORIES.OVENS
    },
    {
        label: "commons.categories.washerdriers",
        value: PRODUCTS_CATEGORIES.WASHERDRIERS
    },
    {
        label: "commons.categories.dishwashers",
        value: PRODUCTS_CATEGORIES.DISHWASHERS
    },
    {
        label: 'commons.categories.washingmachines',
        value: PRODUCTS_CATEGORIES.WASHINGMACHINES
    },
    {
        label: "commons.categories.cookinghobs",
        value: PRODUCTS_CATEGORIES.COOKINGHOBS
    },
];

export const downloadCsv = (content: CsvDTO | string | undefined, filename: string) => {
    const BOM = "\uFEFF";
    const asAny = content as any;
    const csvTextCandidates = [
        typeof content === 'string' ? content : undefined,
        typeof asAny?.data === 'string' ? asAny.data : undefined,
        typeof asAny?.response === 'string' ? asAny.response : undefined,
        typeof asAny?.response?.data === 'string' ? asAny.response.data : undefined,
        typeof asAny?.body === 'string' ? asAny.body : undefined,
        typeof asAny?.body?.data === 'string' ? asAny.body.data : undefined,
    ];
    const csvText = csvTextCandidates.find((c) => typeof c === 'string' && c.length > 0) ?? '';

    if (!csvText && DEBUG_CONSOLE) {
        console.warn('downloadCsv: no CSV content found in provided payload. Payload keys:', Object.keys(asAny || {}));
    }

    const csvData = `${BOM}${csvText}`;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });

    const url = window.URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
        href: url,
        download: filename || 'report.csv'
    });
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
};
