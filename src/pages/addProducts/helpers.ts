import {PRODUCTS_CATEGORIES} from "../../utils/constants";
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

export const downloadCsv = (content: CsvDTO, filename: string) => {
    const BOM = "\uFEFF";
    const csvData = `${BOM} ${content.data}`;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });

    const url = window.URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
        href: url,
        download: filename
    });
    document.body.appendChild(a);
    a.click();
};