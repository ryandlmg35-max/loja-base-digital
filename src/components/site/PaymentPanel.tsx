import { Link } from "@tanstack/react-router";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
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
  const methods = getPaymentMethods();
  const configured = methods.filter((method) => method.address.length > 0);

  return (
    <div className="well" data-testid="payment-panel">
      <h3>Order registered</h3>
      <hr className="soften" />
      <table className="table table-bordered table-condensed">
        <tbody>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>Order:</b>
            </td>
            <td>{order.id}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>Date:</b>
            </td>
            <td>{new Date(order.createdAt).toLocaleString()}</td>
          </tr>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>Status:</b>
            </td>
            <td>
              <span className="label label-warning">Pending payment</span>
            </td>
          </tr>
          <tr>
            <td style={{ paddingRight: 20 }}>
              <b>Total:</b>
            </td>
            <td>
              <b>{usd(order.total)}</b>
            </td>
          </tr>
        </tbody>
      </table>

      <h4>Items</h4>
      <table className="table table-bordered table-condensed">
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty.</th>
            <th>Total</th>
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
          These products are not in the database yet, so their lines were not stored:{" "}
          {order.pendingItems.join(", ")}. Run the catalog sync from the admin page to complete the
          order records.
        </div>
      ) : null}

      <h4>Payment methods</h4>
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
                      copy
                    </a>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>
          Payment addresses are published by the store on the{" "}
          <Link {...NO_AUTO_ACTIVE_CLASS} to="/support">
            Support
          </Link>{" "}
          page. Send the order id and the payment proof there.
        </p>
      )}

      <p className="text-success">
        Send the payment proof with the order id above. The order moves to <b>pago</b> as soon as
        the payment is confirmed.
      </p>
    </div>
  );
}
