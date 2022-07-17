import NumberFormat from "react-number-format";

export default function Number({ value }) {
  return <NumberFormat value={value} displayType="text" thousandSeparator=" " />;
}
