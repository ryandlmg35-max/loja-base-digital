import { SHIPPING_BUTTONS } from "@/data/catalog";

export function ShippingButtons() {
  return (
    <div className="mybuttons">
      <strong>We ship from:</strong>
      {SHIPPING_BUTTONS.map(([label, file]) => (
        <img
          key={label}
          style={{ marginLeft: 15, marginBottom: 25 }}
          src={`/images/${file}`}
          alt={label}
          title={`${label} products`}
        />
      ))}
    </div>
  );
}
