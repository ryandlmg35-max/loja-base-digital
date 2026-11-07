import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { NO_AUTO_ACTIVE_CLASS } from "@/components/site/link";
import { handleImageError } from "@/components/site/image";
import { PaymentPanel, type PlacedOrder } from "@/components/site/PaymentPanel";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SITE } from "@/data/catalog";
import { supabase } from "@/integrations/supabase/client";
import { cartTotals, useCart } from "@/lib/cart";
import { createOrder } from "@/lib/orders";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: `Check out - ${SITE.name}: 🧪 ⚗️ 💊 American Pharma` },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
    ],
  }),
  component: CartPage,
});

const usd = (value: number) => `$ ${value.toFixed(2)}`;

function CartPage() {
  const { lines, subtotal, count, setQty, remove, clear, hydrated } = useCart();
  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [shipping, setShipping] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    zip: "",
    phone: "",
    email: "",
  });
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, []);

  const { shippingCost, total } = cartTotals(subtotal);

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    setBusy(true);
    const snapshot = lines;
    const result = await createOrder(snapshot, total);
    setBusy(false);

    if (!result.ok) {
      setNotice({ kind: "error", text: result.error });
      return;
    }

    setOrder({
      id: result.orderId,
      total,
      createdAt: new Date().toISOString(),
      lines: snapshot,
      pendingItems: result.pendingItems,
    });
    clear();
    setNotice({
      kind: "ok",
      text: `Order ${result.orderId} registered. Our support team will contact you with the payment details.`,
    });
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setNotice({ kind: "ok", text: "Payment address copied to the clipboard." });
    } catch {
      setNotice({ kind: "error", text: "Could not copy the address. Select it manually." });
    }
  };

  return (
    <SiteLayout>
      <div className="row" />
      <div className="row">
        <div className="span12">
          <div className="well well-small">
            <h2>Check Out</h2>
            <hr className="soften" />

            <table className="table table-bordered table-condensed">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Unit price</th>
                  <th>Qty.</th>
                  <th>Total</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {hydrated && lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="cntr">
                      Your cart is empty.{" "}
                      <Link {...NO_AUTO_ACTIVE_CLASS} to="/">
                        Go back to the store
                      </Link>
                    </td>
                  </tr>
                ) : null}
                {lines.map((line) => (
                  <tr key={line.product.id}>
                    <td>
                      <Link
                        {...NO_AUTO_ACTIVE_CLASS}
                        to="/product/$id"
                        params={{ id: String(line.product.id) }}
                      >
                        <img
                          src={line.product.image}
                          alt={line.product.name}
                          style={{ maxHeight: 60 }}
                          onError={handleImageError}
                        />
                      </Link>
                    </td>
                    <td>
                      <Link
                        {...NO_AUTO_ACTIVE_CLASS}
                        to="/product/$id"
                        params={{ id: String(line.product.id) }}
                      >
                        {line.product.name}
                      </Link>
                    </td>
                    <td>{usd(line.product.price)}</td>
                    <td>
                      <input
                        type="number"
                        className="input-mini"
                        min={1}
                        max={10000}
                        value={line.qty}
                        onChange={(event) =>
                          setQty(line.product.id, Number(event.target.value) || 0)
                        }
                        style={{ width: 60 }}
                      />
                    </td>
                    <td>{usd(line.lineTotal)}</td>
                    <td>
                      <a
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          remove(line.product.id);
                        }}
                      >
                        <span className="icon-remove-sign" /> Remove
                      </a>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={4} className="alignR">
                    Total of products: <small>(min. order is {usd(SITE.minOrder)})</small>
                  </td>
                  <td>{usd(subtotal)}</td>
                  <td />
                </tr>
                <tr>
                  <td colSpan={4} className="alignR">
                    Referral Bonus:{" "}
                  </td>
                  <td>{usd(SITE.referralBonus)}</td>
                  <td />
                </tr>
                <tr>
                  <td colSpan={4} className="alignR">
                    Shipping <small>(Free shipping at {usd(SITE.freeShippingFrom)})</small>:
                  </td>
                  <td>{usd(shippingCost)}</td>
                  <td />
                </tr>
                <tr>
                  <td colSpan={4} className="alignR">
                    <b>Total:</b>
                  </td>
                  <td>
                    <b>{usd(total)}</b>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
            <br />

            <table className="table table-bordered">
              <tbody>
                <tr>
                  <td>
                    <b>Shipping data</b>
                  </td>
                </tr>
                <tr>
                  <td>
                    {user ? (
                      <form className="form-horizontal" onSubmit={placeOrder}>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-name">
                            Full name <sup>*</sup>
                          </label>
                          <div className="controls">
                            <input
                              id="ship-name"
                              type="text"
                              value={shipping.name}
                              onChange={(event) =>
                                setShipping({ ...shipping, name: event.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-address">
                            Address <sup>*</sup>
                          </label>
                          <div className="controls">
                            <input
                              id="ship-address"
                              type="text"
                              value={shipping.address}
                              onChange={(event) =>
                                setShipping({ ...shipping, address: event.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-city">
                            City <sup>*</sup>
                          </label>
                          <div className="controls">
                            <input
                              id="ship-city"
                              type="text"
                              value={shipping.city}
                              onChange={(event) =>
                                setShipping({ ...shipping, city: event.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-country">
                            Country <sup>*</sup>
                          </label>
                          <div className="controls">
                            <input
                              id="ship-country"
                              type="text"
                              value={shipping.country}
                              onChange={(event) =>
                                setShipping({ ...shipping, country: event.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-zip">
                            ZIP
                          </label>
                          <div className="controls">
                            <input
                              id="ship-zip"
                              type="text"
                              value={shipping.zip}
                              onChange={(event) =>
                                setShipping({ ...shipping, zip: event.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-phone">
                            Phone
                          </label>
                          <div className="controls">
                            <input
                              id="ship-phone"
                              type="text"
                              value={shipping.phone}
                              onChange={(event) =>
                                setShipping({ ...shipping, phone: event.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <label className="control-label" htmlFor="ship-email">
                            E-mail
                          </label>
                          <div className="controls">
                            <input
                              id="ship-email"
                              type="email"
                              value={shipping.email}
                              onChange={(event) =>
                                setShipping({ ...shipping, email: event.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="control-group">
                          <div className="controls">
                            <button
                              type="submit"
                              className="shopBtn"
                              disabled={busy || count === 0}
                            >
                              <span className="icon-shopping-cart" /> Place order
                            </button>
                          </div>
                        </div>
                        {notice ? (
                          <div
                            className={
                              notice.kind === "ok" ? "alert alert-success" : "alert alert-error"
                            }
                          >
                            {notice.text}
                          </div>
                        ) : null}
                      </form>
                    ) : (
                      <>
                        <br />
                        <b>
                          Please{" "}
                          <Link {...NO_AUTO_ACTIVE_CLASS} to="/login">
                            Login or Register
                          </Link>{" "}
                          to place an order.
                        </b>
                        <br />
                      </>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            {order ? (
              <PaymentPanel order={order} onCopy={(address) => void copyAddress(address)} />
            ) : null}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
