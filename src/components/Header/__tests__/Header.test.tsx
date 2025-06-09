import React from 'react';
import { renderWithContext } from '../../../utils/__tests__/test-utils';
import Header from '../Header';
import { mockedUser } from '../../../decorators/__mocks__/withLogin';
import { Party } from '../../../model/Party';

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('test suite for Header', () => {
  const mockedParties: Array<Party> = [
    {
      roles: [
        {
          partyRole: 'SUB_DELEGATE',
          roleKey: 'incaricato-ente-creditore',
        },
      ],
      description: 'Comune di Bari',
      urlLogo: 'image',
      status: 'ACTIVE',
      partyId: '1',
      digitalAddress: 'comune.bari@pec.it',
      fiscalCode: 'fiscalCodeBari',
      category: 'Comuni e loro Consorzi e Associazioni',
      registeredOffice: 'Piazza della Scala, 2 - 20121 Milano',
      typology: 'Pubblica Amministrazione',
      externalId: 'externalId1',
      originId: 'originId1',
      origin: 'IPA',
      institutionType: 'PA',
    },
    {
      roles: [
        {
          partyRole: 'SUB_DELEGATE',
          roleKey: 'incaricato-ente-creditore',
        },
      ],
      description: 'Comune di Bari',
      urlLogo: 'image',
      status: 'ACTIVE',
      partyId: '1',
      digitalAddress: 'comune.bari@pec.it',
      fiscalCode: 'fiscalCodeBari',
      category: 'Comuni e loro Consorzi e Associazioni',
      registeredOffice: 'Piazza della Scala, 2 - 20121 Milano',
      typology: 'Pubblica Amministrazione',
      externalId: 'externalId1',
      originId: 'originId1',
      origin: 'IPA',
      institutionType: 'PA',
    },
  ];

  test('render Header with no parties', () => {
    renderWithContext(
      <Header parties={[]} loggedUser={mockedUser} withSecondHeader={false} onExit={jest.fn()} />
    );
  });

  test('render Header with parties', () => {
    renderWithContext(
      <Header
        parties={mockedParties}
        loggedUser={mockedUser}
        withSecondHeader={false}
        onExit={jest.fn()}
      />
    );
  });
});
