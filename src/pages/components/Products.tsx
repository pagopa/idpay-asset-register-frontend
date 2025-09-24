import ProductDataGrid from '../../components/Product/ProductDataGrid';

type Props = {
  organizationId: string;
};

const Products = ({ organizationId }: Props) => <ProductDataGrid organizationId={organizationId} />;

export default Products;
