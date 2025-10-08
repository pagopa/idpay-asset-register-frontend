import {Institution} from "../../model/Institution";
import {InstitutionsResponse} from "../../api/generated/register/InstitutionsResponse";

export type Order = 'asc' | 'desc';
export type Value = string;

export interface EnhancedTableProps {
    order: Order;
    orderBy: string;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Institution) => void;
}

export interface HeadCell {
    disablePadding: boolean;
    id: keyof Institution;
    label: string;
    numeric: boolean;
    textAlign?: any;
}


export const paginateInstitutions = (
    data: InstitutionsResponse | null,
    page: number,
    rowsPerPage: number
): InstitutionsResponse => {
    const institutions = data?.institutions ?? [];

    return {
        institutions: institutions.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        )
    };
};

export function sortInstitutions(
    array: Array<Institution>,
    order: 'asc' | 'desc',
    orderBy: keyof Institution
): Array<Institution> {
    const isDateField = orderBy === 'createdAt' || orderBy === 'updatedAt';

    const parseDate = (dateStr: string): number => {
        if (!dateStr) {
            return 0;
        }

        if (dateStr.includes('T') || dateStr.includes('Z')) {
            const parsed = new Date(dateStr);
            if (isNaN(parsed.getTime())) {
                return 0;
            }
            return parsed.getTime();
        }

        const parts = dateStr.split('/');
        if (parts.length !== 3) {
            return 0;
        }

        const [day, month, year] = parts;

        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
            return 0;
        }

        if (monthNum < 1 || monthNum > 12) {
            return 0;
        }

        if (dayNum < 1 || dayNum > 31) {
            return 0;
        }

        const parsed = new Date(yearNum, monthNum - 1, dayNum);

        if (isNaN(parsed.getTime())) {
            return 0;
        }

        return parsed.getTime();
    };

    const compareValues = (a: any, b: any): number => {
        if (a == null) {return 1;}
        if (b == null) {return -1;}

        if (isDateField && typeof a === 'string' && typeof b === 'string') {
            return parseDate(a) - parseDate(b);
        }

        if (typeof a === 'string' && typeof b === 'string') {
            return a.localeCompare(b);
        }

        return a < b ? -1 : a > b ? 1 : 0;
    };

    return [...array].sort((a, b) => {
        const result = compareValues(a[orderBy], b[orderBy]);
        return order === 'asc' ? result : -result;
    });
}