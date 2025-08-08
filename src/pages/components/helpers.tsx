import {Chip} from "@mui/material";
import {ProductDTO} from "../../api/generated/register/ProductDTO";

export function renderUploadStatusIcon(status: string) {
    const chipSx = {
        mb: 1,
        whiteSpace: 'nowrap',
        '& .MuiChip-label': {
            whiteSpace: 'nowrap',
            overflow: 'visible',
            textOverflow: 'clip',
            paddingLeft: '12px',
            paddingRight: '12px',
        }
    };
    switch (status) {
        case 'APPROVED':
        case 'UPLOADED':
            return (
                <Chip
                    color="default"
                    label="Da revisionare"
                    size="medium"
                    sx={chipSx}
                />
            );
        case 'SUPERVISIONED':
            return (
                <Chip
                    color="primary"
                    label="Da controllare"
                    size="medium"
                    sx={chipSx}
                />
            );
        case 'REJECTED':
            return (
                <Chip
                    color="error"
                    label="Escluso"
                    size="medium"
                    sx={chipSx}
                />
            );
        default:
            return;
    }
}

export interface ProductsTableProps {
    tableData: Array<ProductDTO>;
    emptyData?: string;
    order: 'asc' | 'desc';
    orderBy: keyof ProductDTO;
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ProductDTO) => void;
    handleListButtonClick: (row: ProductDTO) => void;
    selected: Array<string>;
    setSelected: React.Dispatch<React.SetStateAction<Array<string>>>;
}

export const rowTableSx = {
    backgroundColor: '#FFFFFF',
    transition: 'background-color 0.2s',
    '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
};

export const cellBaseSx = {
    borderBottom: '1px solid #e0e0e0',
    boxSizing: 'border-box',
    whiteSpace: 'nowrap' as const,
};

export const cellLeftSx = {
    ...cellBaseSx,
    textAlign: 'left' as const,
};

export const cellCenterSx = {
    ...cellBaseSx,
    textAlign: 'center' as const,
};

export const cellRightSx = {
    ...cellBaseSx,
    textAlign: 'right' as const,
};

export const checkboxCellSx = {
    ...cellBaseSx,
    textAlign: 'left' as const,
    width: '60px',
    padding: '16px',
};

export const actionsCellSx = {
    ...cellBaseSx,
    textAlign: 'center' as const,
    width: '60px',
    padding: '16px',
};