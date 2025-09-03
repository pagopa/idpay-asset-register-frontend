import { SelfcareRole, UserRole } from './Party';

export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

export type Product = {
  activationDateTime?: Date;
  description: string;
  id: string;
  logo?: string;
  title: string;
  urlBO: string;
  urlPublic?: string;
  selfcareRole?: SelfcareRole;
  roles: Array<UserRole>;
  authorized?: boolean;
  status: ProductStatus;
  imageUrl: string;
  subProducts: Array<SubProduct>;
};

export type SubProduct = {
  id: string;
  title: string;
  status: ProductStatus;
};
export type ProductsMap = { [id: string]: Product };

export type statusChangeMessage = {
  username?: string;
  role?: string;
  motivation?: string;
  updateDate?: string;
};