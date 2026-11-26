import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MenuItem, ThemeProvider } from '@mui/material';
import { theme } from '@pagopa/mui-italia/theme';
import { Autocomplete } from '@pagopa/mui-italia/components/Autocomplete';
import { MIAlert } from '@pagopa/mui-italia/components/MIAlert';
import { MIButton } from '@pagopa/mui-italia/components/MIButton';
import { MIChip } from '@pagopa/mui-italia/components/MIChip';
import { MIDivider } from '@pagopa/mui-italia/components/MIDivider';
import { MIIconButton } from '@pagopa/mui-italia/components/MIIconButton';
import { MIMenu } from '@pagopa/mui-italia/components/MIMenu';
import { MIPagination } from '@pagopa/mui-italia/components/MIPagination';
import { MIPaper } from '@pagopa/mui-italia/components/MIPaper';
import { MISelect } from '@pagopa/mui-italia/components/MISelect';
import { MISnackbar } from '@pagopa/mui-italia/components/MISnackbar';
import { MISpinner } from '@pagopa/mui-italia/components/MISpinner';
import { MIStepper } from '@pagopa/mui-italia/components/MIStepper';
import { MISwitch } from '@pagopa/mui-italia/components/MISwitch';
import { MITextField } from '@pagopa/mui-italia/components/MITextField';

describe('Componenti mui-italia pubblicati', () => {
  it('renderizza i controlli con il tema PagoPA', () => {
    render(
      <ThemeProvider theme={theme}>
        <MIButton>Conferma</MIButton>
        <MITextField label="Testo" />
        <MISwitch inputProps={{ 'aria-label': 'Interruttore' }} />
        <MIChip label="Stato" />
        <MIPaper>Contenuto</MIPaper>
        <MIDivider />
        <MISelect value="one" inputProps={{ 'aria-label': 'Selezione' }}>
          <MenuItem value="one">Uno</MenuItem>
        </MISelect>
        <Autocomplete options={['Uno']} label="Ricerca" />
        <MIPagination count={2} />
        <MIAlert severity="error">Errore</MIAlert>
        <MISnackbar open severity="success" description="Salvato" onClose={() => {}} />
        <MISpinner />
        <MIIconButton aria-label="Azione">A</MIIconButton>
        <MIStepper steps={[{ label: 'Primo' }]} activeStep={0} />
      </ThemeProvider>
    );

    expect(screen.getByRole('button', { name: 'Conferma' })).toBeInTheDocument();
    expect(screen.getByLabelText('Testo')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Interruttore' })).toBeInTheDocument();
    expect(screen.getByText('Stato')).toBeInTheDocument();
    expect(screen.getByText('Contenuto')).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Selezione' })).toBeInTheDocument();
    expect(screen.getByText('Ricerca', { selector: 'label' })).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByText('Errore')).toBeInTheDocument();
    expect(screen.getByText('Salvato')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Azione' })).toBeInTheDocument();
    expect(screen.getByText('Primo')).toBeInTheDocument();
  });

  it('renderizza il menu dal subpath ufficiale', () => {
    render(
      <ThemeProvider theme={theme}>
        <MIMenu open anchorEl={document.body} items={[{ id: 'item', label: 'Voce' }]} />
      </ThemeProvider>
    );
    expect(screen.getByRole('menuitem', { name: 'Voce' })).toBeInTheDocument();
  });
});

