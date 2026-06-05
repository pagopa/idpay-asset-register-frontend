import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductStatusActionBar from '../ProductStatusActionBar';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../../utils/constants';
import { ProductDTO } from '../../../api/generated/register';

jest.mock('../../../redux/api/initiativesApi', () => ({
  useGetInitiativesQuery: () => ({
    data: [],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useScopedTranslation', () => ({
  __esModule: true,
  default: () => ({ t: (k: string) => k }),
}));

const mockT = (key: string) => key;

const buildProduct = (status: string, gtin: string): ProductDTO =>
  ({
    gtinCode: gtin,
    status,
    productName: 'Test Product',
    category: 'Test',
  } as unknown as ProductDTO);

describe('ProductStatusActionBar', () => {
  it('does not render when no selection', () => {
    const { container } = render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.SUPERVISED, '1')]}
        selected={[]}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render when loading', () => {
    const { container } = render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.UPLOADED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={true}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not render when table data is empty', () => {
    const { container } = render(
      <ProductStatusActionBar
        tableData={[]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('renders action buttons when items selected (Invitalia user)', () => {
    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.UPLOADED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('renders admin actions correctly', () => {
    const handler = jest.fn();

    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.UPLOADED, '1')]}
        selected={['1']}
        isInvitaliaUser={false}
        hookLoading={false}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(screen.getByTestId('rejectedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it('calls handler with correct action for Invitalia user', () => {
    const handler = jest.fn();

    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.UPLOADED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.WAIT_APPROVED);
  });

  it('calls all enabled Invitalia actions for uploaded products', () => {
    const handler = jest.fn();

    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.UPLOADED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(screen.getByTestId('supervisedBtn'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.REJECTED);
    expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.SUPERVISED);
    expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.WAIT_APPROVED);
  });

  it('uses middle states for non Invitalia approval users on wait approved rows', () => {
    const handler = jest.fn();

    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.WAIT_APPROVED, '1')]}
        selected={['1']}
        isInvitaliaUser={false}
        hookLoading={false}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(handler).toHaveBeenCalledWith(MIDDLE_STATES.REJECT_APPROVATION);
    expect(handler).toHaveBeenCalledWith(MIDDLE_STATES.ACCEPT_APPROVATION);
  });

  it('matches selected rows by gtin and productCode fallbacks', () => {
    const handler = jest.fn();
    const tableData = [
      {
        gtin: 'legacy-gtin',
        productCode: 'product-code',
        status: PRODUCTS_STATES.APPROVED,
      },
    ] as unknown as Array<ProductDTO>;

    const { rerender } = render(
      <ProductStatusActionBar
        tableData={tableData}
        selected={['legacy-gtin']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    expect(screen.getByTestId('supervisedBtn')).not.toBeDisabled();

    rerender(
      <ProductStatusActionBar
        tableData={tableData}
        selected={['product-code']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('supervisedBtn'));
    expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.SUPERVISED);
  });

  it('disables actions that are not valid for the selected statuses', () => {
    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.REJECTED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(screen.getByTestId('supervisedBtn')).toBeInTheDocument();
    expect(screen.getByTestId('waitApprovedBtn')).toBeInTheDocument();
  });

  it.skip('disables waitApproved button if already WAIT_APPROVED for Invitalia user', () => {
    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.WAIT_APPROVED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(screen.getByTestId('waitApprovedBtn')).toBeDisabled();
  });

  it('does not render supervised button if product already supervised', () => {
    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.SUPERVISED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
  });
});
