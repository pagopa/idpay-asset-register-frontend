export interface IDPayUser {
  uid: string;
  taxCode: string;
  name: string;
  surname: string;
  email: string;
  org_name: string;
  org_party_role: string;
  org_role: string;
}

export const IdPayUser = (resources: IDPayUser) => ({
  uid: resources.uid,
  taxCode: resources.taxCode,
  name: resources.name,
  surname: resources.surname,
  email: resources.email,
  org_party_role: resources.org_party_role,
  org_rule: resources.org_role,
});
