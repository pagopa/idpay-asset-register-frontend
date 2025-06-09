import { /* institutionResource2Party, */ Party } from '../model/Party';

export const fetchParties = (): Promise<Array<Party>> => new Promise((resolve) => resolve([]));

export const fetchPartyDetails = (
  partyId: string,
  parties?: Array<Party>
): Promise<Party | null> => retrieveParty(partyId, parties);

// check inside parties as first
const retrieveParty = (
  partyId: string,
  parties: Array<Party> | undefined
): Promise<Party | null> => {
  if (parties) {
    const selected = parties.filter((p) => p.partyId === partyId);
    if (selected && selected.length > 0) {
      return new Promise((resolve) => resolve(selected[0]));
    } else {
      return retrieveParty_fetch(partyId);
    }
  } else {
    return retrieveParty_fetch(partyId);
  }
};

const retrieveParty_fetch = (_partyId: string): Promise<Party | null> => new Promise((resolve) => resolve(null));
  // TODO Implementation of call to selfcare to populate switch change entities
  // PortalApi.getInstitution(partyId).then((institutionResource) =>
  //   institutionResource ? institutionResource2Party(institutionResource) : null
  // );
