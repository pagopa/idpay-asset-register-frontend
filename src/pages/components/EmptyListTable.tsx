import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

type EmptyListTableProps = {
  message: string;
};

const EmptyListTable: React.FC<EmptyListTableProps> = ({ message }) => {
  const { t } = useTranslation();

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        height: '56px',
        borderRadius: '4px',
        cursor: 'pointer',
      }}
      data-testid="empty-list-table"
    >
      <Table>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={6}
              align="center"
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              {t(message)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EmptyListTable;
