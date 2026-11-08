import { Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { useT } from "@/i18n/context";
import { getPaymentMethods } from "@/data/payments";
import type { CartLine } from "@/lib/cart";

export type PlacedOrder = {
  id: string;
  total: number;
  createdAt: string;
  lines: CartLine[];
  pendingItems: string[];
};

const usd = (value: number) => `$ ${value.toFixed(2)}`;

/**
 * Order receipt + payment rail. The original shop collects crypto through the support
 * team, so the addresses come from the environment (VITE_CRYPTO_<COIN>) and the panel
 * falls back to the support page when the store has not published them yet.
 */
export function PaymentPanel({
  order,
  onCopy,
}: {
  order: PlacedOrder;
  onCopy?: (address: string) => void;
}) {
  const t = useT();
  const methods = getPaymentMethods();
  const configured = methods.filter((method) => method.address.length > 0);

  return (
    <div className="well" data-testid="payment-panel">
      <h3>{t("cart.orderRegistered")}</h3>
      <hr className="soften" />
      <table className="table table-bordered table-condensed">
        <tbody>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>{t("cart.order")}</b>
            </td>
            <td>{order.id}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>{t("cart.date")}</b>
            </td>
            <td>{new Date(order.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>{t("cart.status")}</b>
            </td>
            <td>
              <span className="label label-warning">{t("cart.pendingPayment")}</span>
            </td>
          </tr>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>{t("cart.grandTotal")}</b>
            </td>
            <td>
              <b>{usd(order.total)}</b>
            </td>
          </tr>
        </tbody>
      </table>

      <h4>{t("cart.items")}</h4>
      <table className="table table-bordered table-condensed">
        <thead>
          <tr>
            <th>{t("cart.name")}</th>
            <th>{t("cart.qty")}</th>
            <th>{t("cart.total")}</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((line) => (
            <tr key={line.product.id}>
              <td>{line.product.name}</td>
              <td>{line.qty}</td>
              <td>{usd(line.lineTotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {order.pendingItems.length > 0 ? (
        <div className="alert alert-warning">
          {t("cart.pendingWarning", { items: order.pendingItems.join(", ") })}
        </div>
      ) : null}

      <h4>{t("cart.paymentMethods")}</h4>
      {configured.length > 0 ? (
        <table className="table table-bordered table-condensed">
          <tbody>
            {configured.map((method) => (
              <tr key={method.key}>
                <td style={{ paddingRight: 20 }}>
                  <b>{method.label}</b>
                </td>
                <td>
                  <code>{method.address}</code>{" "}
                  {onCopy ? (
                    <a
                      href="#"
                      onClick={(event) => {
                        event.preventDefault();
                        onCopy(method.address);
                      }}
                    >
                      {t("cart.copy")}
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          {t("cart.paymentFallback")}{" "}
          <Link {...NO_AUTO_ACTIVE_CLASS} to="/support">
            {t("nav.support")}
          </Link>
          .
        </p>
      )}

      <p className="text-success">{t("cart.paymentProof")}</p>
    </div>
  );
}
