import { render, screen, fireEvent } from '@testing-library/react';
import DetailDrawer from '../DetailDrawer';
import '@testing-library/jest-dom';

describe('DetailDrawer', () => {
  const toggleDrawer = jest.fn();

  it('renderizza il Drawer aperto con i children', () => {
    render(
        <DetailDrawer open={true} toggleDrawer={toggleDrawer}>
          <div>Contenuto Drawer</div>
        </DetailDrawer>
    );
    expect(screen.getByText('Contenuto Drawer')).toBeInTheDocument();
    expect(screen.getByRole('presentation')).toBeVisible();
  });

  it('non renderizza i children se Drawer è chiuso', () => {
    render(
        <DetailDrawer open={false} toggleDrawer={toggleDrawer}>
          <div>Contenuto Drawer</div>
        </DetailDrawer>
    );
    expect(screen.queryByText('Contenuto Drawer')).not.toBeInTheDocument();
  });

  it('chiama toggleDrawer(false) al click sull\'icona di chiusura', () => {
    render(
        <DetailDrawer open={true} toggleDrawer={toggleDrawer}>
          <div>Contenuto Drawer</div>
        </DetailDrawer>
    );
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(toggleDrawer).toHaveBeenCalledWith(false);
  });

  it('chiama toggleDrawer(false) quando si chiude il Drawer', () => {
    render(
        <DetailDrawer open={true} toggleDrawer={toggleDrawer}>
          <div>Contenuto Drawer</div>
        </DetailDrawer>
    );
    fireEvent.keyDown(screen.getByRole('presentation'), {key: 'Escape'});
    expect(toggleDrawer).toHaveBeenCalledWith(false);
  });
})
