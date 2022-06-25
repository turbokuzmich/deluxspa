import NumberFormat from "react-number-format";

export default function Price({ sum }) {
  return (
    <NumberFormat
      value={sum}
      displayType="text"
      thousandSeparator=" "
      suffix=" ₽"
    />
  );
}
