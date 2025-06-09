import { Party } from '../../model/Party';

export const mockedParties: Array<Party> = [
  {
    partyId: '2b48bf96-fd74-477e-a70a-286b410f020a',
    externalId: '',
    originId: '',
    origin: '',
    description: 'Esercente di test IdPay',
    digitalAddress: '',
    status: 'ACTIVE',
    roles: [{ partyRole: 'MANAGER', roleKey: 'admin' }],
    urlLogo: 'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/onboarded/logo.png',
    fiscalCode: '33444433488',
    registeredOffice: '',
    typology: '',
  },
  {
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore', // TODO use real product role
      },
    ],
    description: 'Comune di Test1',
    urlLogo: 'image',
    status: 'ACTIVE',
    partyId: '1',
    digitalAddress: 'comune.test1@pec.it',
    fiscalCode: 'fiscalCodeTest1',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId1',
    originId: 'originId1',
    origin: 'IPA',
    institutionType: 'PA',
  },
  // useCase for PENDING party
  {
    roles: [
      {
        partyRole: 'DELEGATE',
        roleKey: 'incaricato-ente-creditore', // TODO use real product role
      },
    ],
    description: 'Comune di Test2',
    urlLogo: 'image',
    status: 'PENDING',
    partyId: '2',
    digitalAddress: 'comune.test2@pec.it',
    fiscalCode: 'fiscalCodeTest2',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId2',
    originId: 'originId2',
    origin: 'IPA',
    institutionType: 'PA',
  },
  {
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore', // TODO use real product role
      },
    ],
    description: 'Comune di Test3',
    urlLogo: 'image',
    status: 'ACTIVE',
    partyId: '3',
    digitalAddress: 'comune.test3@pec.it',
    fiscalCode: 'fiscalCodeTest3',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId3',
    originId: 'originId3',
    origin: 'IPA',
    institutionType: 'PA',
  },
  {
    roles: [
      {
        partyRole: 'OPERATOR',
        roleKey: 'referente-dei-pagamenti', // TODO use real product role
      },
    ],
    description: 'Comune di Test4',
    urlLogo: 'image',
    status: 'ACTIVE',
    partyId: '4',
    digitalAddress: 'comune.test4@pec.it',
    fiscalCode: 'fiscalCodeTest4',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId4',
    originId: 'originId4',
    origin: 'IPA',
    institutionType: 'PA',
  },
  // useCase of testToken
  {
    // if change these roles, change them also in testToken
    roles: [
      {
        partyRole: 'MANAGER',
        roleKey: 'referente-legale', // TODO use real product role
      },
    ],
    description: 'AGENCY ONBOARDED',
    urlLogo: 'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/onboarded/logo.png',
    status: 'ACTIVE',
    partyId: 'onboarded',
    digitalAddress: 'comune.onboarded@pec.it',
    fiscalCode: 'fiscalCodeONBOARDED',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId5',
    originId: 'originId5',
    origin: 'MOCK',
    institutionType: 'GSP',
  },
  {
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore', // TODO use real product role
      },
    ],
    description: `Commissario straordinario per la realizzazione di
    approdi temporanei e di interventi complementari`,
    urlLogo: 'image',
    status: 'ACTIVE',
    partyId: '5',
    digitalAddress: 'comune.test5@pec.it',
    fiscalCode: 'fiscalCodeTest5',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId1',
    originId: 'originId1',
    origin: 'IPA',
    institutionType: 'GSP',
  },
  // Usable when not mocking the BE
  {
    partyId: 'f572bb09-b689-4785-8ea8-4c7a8b081998',
    externalId: '00856930102',
    originId: 'c_d969',
    origin: 'IPA',
    institutionType: 'PA',
    description: 'Comune di Test6',
    category: 'Comuni e loro Consorzi e Associazioni',
    fiscalCode: '00856930102',
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore', // TODO use real product role
      },
    ],
    status: 'ACTIVE',
    digitalAddress: 'comuneTest6@postemailcertificata.it',
    urlLogo:
      'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/f572bb09-b689-4785-8ea8-4c7a8b081998/logo.png',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
  },
  // Usable when not mocking the BE
  {
    partyId: '7784b9d3-e834-4342-a6ef-d0566b058af2',
    externalId: '00441340122',
    originId: 'c_l682',
    origin: 'IPA',
    institutionType: 'PA',
    description: 'Comune di Test7',
    category: 'Comuni e loro Consorzi e Associazioni',
    fiscalCode: '00441340122',
    roles: [
      {
        partyRole: 'SUB_DELEGATE',
        roleKey: 'incaricato-ente-creditore', // TODO use real product role
      },
    ],
    status: 'ACTIVE',
    digitalAddress: 'comune.test7@pec.it',
    urlLogo:
      'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/7784b9d3-e834-4342-a6ef-d0566b058af2/logo.png',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
  },
  // useCase of testToken
  {
    // if change these roles, change them also in testToken
    roles: [
      {
        partyRole: 'ADMIN',
        roleKey: 'admin', // TODO use real product role
      },
    ],
    description: 'Comune di Test8',
    urlLogo: 'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/onboarded/logo.png',
    status: 'ACTIVE',
    partyId: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
    digitalAddress: 'comune.test8@pec.it',
    fiscalCode: '00608720272',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId5',
    originId: 'originId5',
    origin: 'MOCK',
    institutionType: 'GSP',
  },
  {
    // if change these roles, change them also in testToken
    roles: [
      {
        partyRole: 'ADMIN',
        roleKey: 'pagopa_admin', // TODO use real product role
      },
    ],
    description: 'Comune di Test9',
    urlLogo: 'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/onboarded/logo.png',
    status: 'ACTIVE',
    partyId: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
    digitalAddress: 'comune.test9@pec.it',
    fiscalCode: '00608720272',
    category: 'Comuni e loro Consorzi e Associazioni',
    registeredOffice: 'Piazza Test, 2 - Comune di test',
    typology: 'Pubblica Amministrazione',
    externalId: 'externalId5',
    originId: 'originId5',
    origin: 'MOCK',
    institutionType: 'GSP',
  },
];

export const verifyFetchPartiesMockExecution = (parties: Array<Party>) => {
  expect(parties).toStrictEqual(mockedParties);
};

export const fetchParties = () => new Promise((resolve) => resolve(mockedParties));

export const verifyFetchPartyDetailsMockExecution = (party: Party) => {
  const test = mockedParties.filter(
    (p) => p.partyId === party.partyId && p.roles[0].roleKey === party.roles[0].roleKey
  )[0];
  expect(party).toStrictEqual(test);
};

export const fetchPartyDetails = (
  partyId: string,
  _parties?: Array<Party>
): Promise<Party | null> =>
  new Promise((resolve) => resolve(mockedParties.find((p) => p.partyId === partyId) ?? null));
