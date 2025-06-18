export interface IDPayUser {
  uid: string;
  taxCode: string;
  name: string;
  surname: string;
  email: string;
  org_name: string;
  org_party_role: string;
  org_role: string;
  org_address:  string;
  org_pec:  string;
  org_taxcode:  string;
  org_vat:  string;
}

export const IdPayUser = (resources: IDPayUser) => ({
  uid: resources.uid,
  taxCode: resources.taxCode,
  name: resources.name,
  surname: resources.surname,
  email: resources.email,
  org_party_role: resources.org_party_role,
  org_role: resources.org_role,
  org_address:  resources.org_address,
  org_pec:  resources.org_pec,
  org_taxcode:  resources.org_taxcode,
  org_vat:  resources.org_vat,
});
