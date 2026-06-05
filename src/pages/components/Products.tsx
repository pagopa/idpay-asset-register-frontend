import ProductDataGrid from '../../components/Product/ProductDataGrid';

type Props = {
  organizationId: string;
  organizationLabel?: string;
};

const Products = ({ organizationId, organizationLabel }: Props) => (
  <ProductDataGrid organizationId={organizationId} organizationLabel={organizationLabel} />
);

export default Products;
