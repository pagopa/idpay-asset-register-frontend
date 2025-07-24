import {PRODUCTS_CATEGORY} from "../../utils/constants";
import {CsvDTO} from "../../api/generated/register/CsvDTO";

export const categoryList = [
    {
        label: "commons.categories.tumbledryers",
        value: PRODUCTS_CATEGORY.TUMBLEDRYERS
    },
    {
        label: "commons.categories.rangehoods",
        value: PRODUCTS_CATEGORY.RANGEHOODS
    },
    {
        label: "commons.categories.ovens",
        value: PRODUCTS_CATEGORY.OVENS
    },
    {
        label: "commons.categories.refrigeratingappl",
        value: PRODUCTS_CATEGORY.REFRIGERATINGAPPL
    },
    {
        label: "commons.categories.washerdriers",
        value: PRODUCTS_CATEGORY.WASHERDRIERS
    },
    {
        label: "commons.categories.dishwashers",
        value: PRODUCTS_CATEGORY.DISHWASHERS
    },
    {
        label: 'commons.categories.washingmachines',
        value: PRODUCTS_CATEGORY.WASHINGMACHINES
    },
    {
        label: "commons.categories.cookinghobs",
        value: PRODUCTS_CATEGORY.COOKINGHOBS
    },
];

export const downloadCsv = (content: CsvDTO, filename: string) => {
    const blob = new Blob([content.data ?? ""], { type: 'text/csv' });

    const url = window.URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
        href: url,
        download: filename
    });
    document.body.appendChild(a);
    a.click();
};