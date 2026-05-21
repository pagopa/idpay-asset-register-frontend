import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductStatusActionBar from '../ProductStatusActionBar';
import { PRODUCTS_STATES, MIDDLE_STATES } from '../../../utils/constants';
import { ProductDTO } from '../../../api/generated/register';

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
        t={mockT}
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
        t={mockT}
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
        t={mockT}
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
        t={mockT}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('rejectedBtn'));
    expect(handler).toHaveBeenCalledWith(MIDDLE_STATES.REJECT_APPROVATION);

    fireEvent.click(screen.getByTestId('waitApprovedBtn'));
    expect(handler).toHaveBeenCalledWith(MIDDLE_STATES.ACCEPT_APPROVATION);
  });

  it('calls handler with correct action for Invitalia user', () => {
    const handler = jest.fn();

    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.UPLOADED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        t={mockT}
        handleOpenModalWithStatusCheck={handler}
      />
    );

    fireEvent.click(screen.getByTestId('waitApprovedBtn'));

    expect(handler).toHaveBeenCalledWith(PRODUCTS_STATES.WAIT_APPROVED);
  });

  it('disables waitApproved button if already WAIT_APPROVED for Invitalia user', () => {
    render(
      <ProductStatusActionBar
        tableData={[buildProduct(PRODUCTS_STATES.WAIT_APPROVED, '1')]}
        selected={['1']}
        isInvitaliaUser={true}
        hookLoading={false}
        t={mockT}
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
        t={mockT}
        handleOpenModalWithStatusCheck={jest.fn()}
      />
    );

    expect(screen.queryByTestId('supervisedBtn')).not.toBeInTheDocument();
  });
});
