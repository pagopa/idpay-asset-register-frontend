// import { PartyRole } from './Party';

/* export type JWTUser = {
  uid: string;
  // fiscal_number: string;
  name: string;
  family_name: string;
  email: string;
  organization: {
    id: string;
    roles: Array<{
      partyRole: PartyRole;
      role: string;
    }>;
  };
}; */

export type JWTUser = {
  // iat: 1657714275,
  // exp: 1657743075,
  // aud: "idpay.welfare.pagopa.it",
  // iss: "https://api-io.dev.cstar.pagopa.it",
  uid: string;
  // fiscal_number: string;
  name: string;
  family_name: string;
  email: string;
  org_id: string;
  org_name: string;
  org_vat: string;
  org_party_role: string;
  org_role: string;
};

export const jwt2JWTUser = (resources: JWTUser) => ({
  uid: resources.uid,
  name: resources.name,
  family_name: resources.family_name,
  email: resources.email,
  org_id: resources.org_id,
  org_name: resources.org_name,
  org_vat: resources.org_vat,
  org_party_role: resources.org_party_role,
  org_role: resources.org_role,
});
