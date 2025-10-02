export interface PaginationInfo {
    from: number;
    to: number;
    total: number;
}

export const calculatePaginationInfo = (
    page: number,
    rowsPerPage: number,
    totalElements: number
): PaginationInfo => {
    const from = page * rowsPerPage + 1;
    const calculatedTo = (page + 1) * rowsPerPage;
    const to = calculatedTo > totalElements ? totalElements : calculatedTo;

    return {
        from,
        to,
        total: totalElements
    };
};

export const usePagination = (
    page: number,
    rowsPerPage: number,
    totalElements: number
): PaginationInfo => calculatePaginationInfo(page, rowsPerPage, totalElements);