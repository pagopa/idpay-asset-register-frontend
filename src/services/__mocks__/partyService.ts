import { expect } from '@jest/globals';
import { Party } from '../../model/Party';

const defaultRegisteredOffice = 'Piazza Test, 2 - Comune di test';
const defaultCategory = 'Comuni e loro Consorzi e Associazioni';
const defaultTypology = 'Pubblica Amministrazione';
const defaultImageUrl = 'image';
const onboardedLogoUrl =
  'https://selcdcheckoutsa.z6.web.core.windows.net/institutions/onboarded/logo.png';

const createRoles = (partyRole: string, roleKey: string) => [
  {
    partyRole,
    roleKey, // TODO use real product role
  },
];

const createComuneParty = ({
  roles,
  description,
  status,
  partyId,
  digitalAddress,
  fiscalCode,
  externalId,
  originId,
  origin = 'IPA',
  institutionType = 'PA',
  urlLogo = defaultImageUrl,
}: Pick<
  Party,
  | 'roles'
  | 'description'
  | 'status'
  | 'partyId'
  | 'digitalAddress'
  | 'fiscalCode'
  | 'externalId'
  | 'originId'
> &
  Partial<Pick<Party, 'origin' | 'institutionType' | 'urlLogo'>>): Party => ({
  roles,
  description,
  urlLogo,
  status,
  partyId,
  digitalAddress,
  fiscalCode,
  category: defaultCategory,
  registeredOffice: defaultRegisteredOffice,
  typology: defaultTypology,
  externalId,
  originId,
  origin,
  institutionType,
});

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
  createComuneParty({
    roles: createRoles('SUB_DELEGATE', 'incaricato-ente-creditore'),
    description: 'Comune di Test1',
    status: 'ACTIVE',
    partyId: '1',
    digitalAddress: 'comune.test1@pec.it',
    fiscalCode: 'fiscalCodeTest1',
    externalId: 'externalId1',
    originId: 'originId1',
  }),
  createComuneParty({
    roles: createRoles('DELEGATE', 'incaricato-ente-creditore'),
    description: 'Comune di Test2',
    status: 'PENDING',
    partyId: '2',
    digitalAddress: 'comune.test2@pec.it',
    fiscalCode: 'fiscalCodeTest2',
    externalId: 'externalId2',
    originId: 'originId2',
  }),
  createComuneParty({
    roles: createRoles('SUB_DELEGATE', 'incaricato-ente-creditore'),
    description: 'Comune di Test3',
    status: 'ACTIVE',
    partyId: '3',
    digitalAddress: 'comune.test3@pec.it',
    fiscalCode: 'fiscalCodeTest3',
    externalId: 'externalId3',
    originId: 'originId3',
  }),
  createComuneParty({
    roles: createRoles('OPERATOR', 'referente-dei-pagamenti'),
    description: 'Comune di Test4',
    status: 'ACTIVE',
    partyId: '4',
    digitalAddress: 'comune.test4@pec.it',
    fiscalCode: 'fiscalCodeTest4',
    externalId: 'externalId4',
    originId: 'originId4',
  }),
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
  createComuneParty({
    roles: createRoles('SUB_DELEGATE', 'incaricato-ente-creditore'),
    description: `Commissario straordinario per la realizzazione di
    approdi temporanei e di interventi complementari`,
    status: 'ACTIVE',
    partyId: '5',
    digitalAddress: 'comune.test5@pec.it',
    fiscalCode: 'fiscalCodeTest5',
    externalId: 'externalId1',
    originId: 'originId1',
    institutionType: 'GSP',
  }),
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
    ...createComuneParty({
      roles: createRoles('ADMIN', 'admin'),
      description: 'Comune di Test8',
      status: 'ACTIVE',
      partyId: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
      digitalAddress: 'comune.test8@pec.it',
      fiscalCode: '00608720272',
      externalId: 'externalId5',
      originId: 'originId5',
      origin: 'MOCK',
      institutionType: 'GSP',
      urlLogo: onboardedLogoUrl,
    }),
  },
  {
    // if change these roles, change them also in testToken
    ...createComuneParty({
      roles: createRoles('ADMIN', 'pagopa_admin'),
      description: 'Comune di Test9',
      status: 'ACTIVE',
      partyId: '2f63a151-da4e-4e1e-acf9-adecc0c4d727',
      digitalAddress: 'comune.test9@pec.it',
      fiscalCode: '00608720272',
      externalId: 'externalId5',
      originId: 'originId5',
      origin: 'MOCK',
      institutionType: 'GSP',
      urlLogo: onboardedLogoUrl,
    }),
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
