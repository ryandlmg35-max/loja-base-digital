import { useT } from "@/i18n/context";
import { SHIPPING_BUTTONS } from "@/data/catalog";
import { SHIPPING_ORIGIN } from "@/data/store";

export function ShippingButtons() {
  const t = useT();

  return (
    <div className="mybuttons">
      <strong>{t("home.weShipFrom")}</strong>
      {SHIPPING_BUTTONS.map(([label, file]) => (
        <img
          key={label}
          style={{ marginLeft: 15, marginBottom: 25 }}
          src={`/images/${file}`}
          alt={SHIPPING_ORIGIN}
          title={t("home.shippingProducts")}
        />
      ))}
    </div>
  );
}
