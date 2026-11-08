import type { Category, Product, Vendor } from "@/data/catalog";
import type { Lang } from "./types";

/**
 * Texto do catálogo em português. O original fica em `src/data/catalog.ts`
 * (gerado pelo scraper) e é a fonte da versão em inglês.
 */

export const PRODUCT_NAMES_PT: Record<number, string> = {
  145: "MCT – Masteron Propionato 100mg/ml – Frasco 10ml",
  144: "Winstrol (Stanozolol) 25mg x 50 Cápsulas",
  143: "Primobolan Enanthato 100mg/ml – Frasco 10ml",
  142: "MCT – Test 400 – 400mg/ml – Frasco 10ml",
  141: "Sildenafil (Viagra) 20mg x 25 Cápsulas",
  140: "Arimidex 0.5mg/ml x 30ml Gotas Líquidas",
  139: "Clomid 50mg x 30 Cápsulas",
  138: "MCT – NPP 100mg/ml – Frasco 10ml",
  137: "Kit HGH 100iu – (10 frascos x 10iu)",
  136: "MCT – Sustanon 250mg/ml – Frasco 10ml",
  135: "Sustanon 250mg/ml – Frasco 10ml",
  134: "Superdrol 10mg x 50 Cápsulas",
  133: "Anadrol 50mg x 50 Cápsulas",
  132: "Equipoise (Boldenona) – 250mg/ml – Frasco 10ml",
  131: "Tirzepatida – Frasco 5mg",
  130: "Dianabol 20mg/ml x 30ml Gotas Líquidas",
  129: "NPP 100mg/ml – Frasco 10ml",
  128: "HGH Frasco 10iu",
  127: "Retatrutida – Frasco 5mg",
  126: "Nolvadex (Tamoxifeno) 20mg/ml x 30ml Gotas Líquidas",
  125: "Testosterona Propionato 100mg/ml – Frasco 10ml",
  124: "MCT – Equipoise (Boldenona) 250mg/ml – Frasco 10ml",
  123: "BPC 157 – Frasco 5mg",
  122: "Kit HCG 50.000iu – (10 frascos x 5.000iu)",
  121: "MCT – Masteron Enanthato 200mg/ml – Frasco 10ml",
  120: "Winstrol (Stanozolol) 20mg/ml x 30ml Gotas Líquidas",
  119: "Masteron Propionato 100mg/ml – Frasco 10ml",
  118: "Aromasin 25mg x 30 Cápsulas – EUA",
  117: "Ipamorelin – Frasco 5mg",
  116: "TB-500 – Frasco 5mg",
  115: "MCT – Testosterona Propionato 100mg/ml – Frasco 10ml",
  114: "Masteron Enanthato 200mg/ml – Frasco 10ml",
  113: "Trenbolona Enanthato 200mg/ml – Frasco 10ml",
  112: "Stack de Cutting",
  111: "Testosterona Undecilato (Teste Oral) 20mg x 50 Cápsulas",
  110: "CJC-1295 (Sem DAC) – Frasco 2mg",
  109: "Melanotan 2 – Frasco 10mg",
  108: "CJC-1295 (Com DAC) – Frasco 2mg",
  107: "Clomid 50mg/ml x 30ml Gotas Líquidas",
  106: "Trenbolona Acetato 200mg/ml – Frasco 10ml",
  105: "HGH Frasco 12iu",
  104: "TTM 300mg/ml – Frasco 10ml",
  103: "MCT – Trenbolona Enanthato 200mg/ml – Frasco 10ml",
  102: "Superdrol 20mg/ml x 30ml Gotas Líquidas",
  101: "Aromasin 25mg/ml x 30ml Gotas Líquidas",
  100: "MCT – Trenbolona Acetato 200mg/ml – Frasco 10ml",
  99: "Anadrol 50mg/ml x 30ml Gotas Líquidas",
  98: "Proviron 25mg/ml x 30ml Gotas Líquidas",
  97: "Stack de Bulking",
  96: "(MCT) TTM 300mg/ml – Frasco 10ml",
  95: "Cialis 20mg x 25 Cápsulas",
  94: "Masteron Enanthato 100mg/ml – Frasco 10ml",
  93: "Nolvadex (Tamoxifeno) 25mg x 50 Cápsulas",
  92: "Cialis 20mg/ml x 30ml Gotas Líquidas",
  91: "MCT – Primobolan Enanthato 100mg/ml – Frasco 10ml",
  90: "Anavar 10mg x 50 Cápsulas",
  89: "MCT – Trenbolona Enanthato 100mg/ml – Frasco 10ml",
  88: "Dianabol 10mg x 100 Cápsulas",
  87: "Anavar 20mg/ml x 30ml Gotas Líquidas",
  86: "MCT – Masteron Enanthato 100mg/ml – Frasco 10ml",
  85: "Trenbolona Acetato 100mg/ml – Frasco 10ml",
  84: "Trenbolona Enanthato 100mg/ml – Frasco 10ml",
  83: "MCT – Testosterona Cipionato 250mg/ml – Frasco 10ml",
  82: "Testosterona Enanthato 250mg/ml – Frasco 10ml",
  81: "MCT – Testosterona Enanthato 250mg/ml – Frasco 10ml",
  80: "HCG Frasco 5.000iu",
  79: "Test 400 – 400mg/ml – Frasco 10ml",
  78: "Testosterona Cipionato 250mg/ml – Frasco 10ml",
  77: "MCT – Trenbolona Acetato 100mg/ml – Frasco 10ml",
  76: "Anavar 25mg x 30 Cápsulas – EUA",
  75: "Semaglutida – Frasco 5mg",
  74: "Cialis 20mg/ml x 30ml Gotas Líquidas",
  73: "Anavar 10mg x 50 Cápsulas",
  72: "Dianabol 10mg x 100 Cápsulas",
  71: "Nolvadex (Tamoxifeno) 25mg x 50 Cápsulas",
  70: "Superdrol 10mg x 50 Cápsulas",
  69: "MCT – Trenbolona Acetato 200mg/ml – Frasco 10ml",
  68: "MCT – Primobolan Enanthato 100mg/ml – Frasco 10ml",
  67: "MCT – Testosterona Cipionato 250mg/ml – Frasco 10ml",
};

export const CATEGORY_NAMES_PT: Record<number, string> = {
  0: "Todos os produtos",
  1: "Óleo de semente de uva (Brasil)",
  2: "Produtos HGH/HCG (Brasil)",
  3: "Óleo MCT (Brasil)",
  4: "Produtos orais (Brasil)",
  5: "Peptídeos (Brasil)",
  6: "Stacks completos",
  8: "Óleo de semente de uva (Brasil)",
  9: "Óleo MCT (Brasil)",
  10: "Produtos orais (Brasil)",
  11: "Óleo de semente de uva (Brasil)",
  12: "Produtos HGH/HCG (Brasil)",
  13: "Óleo MCT (Brasil)",
  14: "Produtos orais (Brasil)",
  15: "Peptídeos (Brasil)",
};

export const FAQ_PT: Array<{ title: string; html: string }> = [
  {
    title: "Envio",
    html: `<p>
                        Todos os itens são enviados do Brasil, com embalagem discreta e sem identificação do conteúdo, envio prioritário e rastreamento.
                        <br>
                        <br>
                        <b>Custos de envio:</b><br> R$ 27,50.<br> Frete grátis acima de R$ 1.100,00.
                        <br><br>
                        <b>Prazos de entrega:</b><br>
                    </p>
                    <table>
                        <tbody>
                            <tr>
                                <td style="padding-right:20px;">Brasil:</td>
                                <td>2 - 7 dias úteis</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">América do Sul:</td>
                                <td>5 - 12 dias úteis</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">América do Norte:</td>
                                <td>8 - 16 dias úteis</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Europa:</td>
                                <td>10 - 20 dias úteis</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Ásia:</td>
                                <td>12 - 24 dias úteis</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Oceania:</td>
                                <td>15 - 28 dias úteis</td>
                            </tr>
                        </tbody>
                    </table>

                    <br>

                    <b>Segurança</b><br> Todos os pedidos saem do Brasil com embalagem dupla e código de rastreio enviado para o seu e-mail. Dentro do Brasil a entrega é feita pelos Correios ou por transportadora parceira.
                    <br>

                    <br>

                    <b>Encomendas perdidas</b><br> Se você não receber seu pedido dentro do prazo informado, fale com a gente. Enviamos um pacote substituto ou devolvemos o valor do seu pedido.
                    <p></p>`,
  },
  {
    title: "Formas de pagamento",
    html: `<p>
                        No momento aceitamos:
                    </p>
                    <ul>
                        <li>Monero</li>
                        <li>Bitcoin</li>
                        <li>Ethereum</li>
                        <li>Litecoin</li>
                        <li>Solana</li>
                        <li>Dogecoin</li>
                        <li>TRON</li>
                        <li>Ripple</li>
                        <li>USDT</li>
                    </ul>
                    <p></p>`,
  },
  {
    title: "Onde comprar moeda cripto?",
    html: `<p>
                        Para quem não tem experiência, recomendamos usar uma carteira online.<br>
                        Estas são algumas carteiras online que podemos recomendar:<br>
                    </p>
                    <ul>
                        <li>
                            <a target="_blank" href="https://www.binance.com/br">binance.com/br</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.coinbase.com/">coinbase.com</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://wallet.cex.io/">cex.io</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.blockchain.com/wallet">blockchain.com</a>
                        </li>
                    </ul>
                    <p></p>`,
  },
  {
    title: "Existe pedido mínimo?",
    html: `<p>
                        Sim. O pedido mínimo é de R$ 330,00.
                    </p>`,
  },
  {
    title: "O que acontece com meus dados?",
    html: `<p>
                        O que guardamos e por quanto tempo:
                    </p>
                    <table>
                        <tbody>
                            <tr>
                                <td style="padding-right:20px;">Usuário, senha, histórico de pedidos:</td>
                                <td>Até você apagar sua conta.</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Endereço de envio:</td>
                                <td>Prazo máximo de envio mais 10 dias.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br> Dados que poderiam identificar você (como o nome do recebedor e o endereço de envio) ficam guardados criptografados (criptografia de chave pública e privada).<br>
                    Nossa chave privada também é criptografada com uma senha.<br>
                    <b>Ou seja: se alguém tivesse acesso aos dados do seu pedido, precisaria da nossa chave privada e da senha dela para descriptografar seu endereço.</b><br>
                    Isso oferece a maior segurança possível.
                    <p></p>`,
  },
  {
    title: "Tenho outra pergunta!",
    html: `<p>
                        Estamos aqui para ajudar! Entre ou crie uma conta, vá até a página de suporte e envie sua mensagem.
                    </p>`,
  },
];

export const FAQ_EN: Array<{ title: string; html: string }> = [
  {
    title: "Shipping",
    html: `<p>
                        Every item is shipped from Brazil, in discreet packaging with no content on the label, priority shipping and tracking.
                        <br>
                        <br>
                        <b>Shipping costs:</b><br> R$ 27.50.<br> Free shipping over R$ 1,100.00.
                        <br><br>
                        <b>Delivery times:</b><br>
                    </p>
                    <table>
                        <tbody>
                            <tr>
                                <td style="padding-right:20px;">Brazil:</td>
                                <td>2 - 7 working days</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">South America:</td>
                                <td>5 - 12 working days</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">North America:</td>
                                <td>8 - 16 working days</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Europe:</td>
                                <td>10 - 20 working days</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Asia:</td>
                                <td>12 - 24 working days</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Oceania:</td>
                                <td>15 - 28 working days</td>
                            </tr>
                        </tbody>
                    </table>

                    <br>

                    <b>Safety</b><br> Every order leaves Brazil with double packaging and a tracking code sent to your email. Inside Brazil the parcel is delivered by Correios or a partner carrier.
                    <br>

                    <br>

                    <b>Lost orders</b><br> If your order does not arrive within the stated window, talk to us. We send a replacement package or refund the order.
                    <p></p>`,
  },
  {
    title: "Payment methods",
    html: `<p>
                        Right now we accept:
                    </p>
                    <ul>
                        <li>Monero</li>
                        <li>Bitcoin</li>
                        <li>Ethereum</li>
                        <li>Litecoin</li>
                        <li>Solana</li>
                        <li>Dogecoin</li>
                        <li>TRON</li>
                        <li>Ripple</li>
                        <li>USDT</li>
                    </ul>
                    <p></p>`,
  },
  {
    title: "Where to get crypto currency?",
    html: `<p>
                        For anyone without experience we recommend an online wallet.<br>
                        These are some online wallets we can recommend:<br>
                    </p>
                    <ul>
                        <li>
                            <a target="_blank" href="https://www.binance.com/br">binance.com/br</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.coinbase.com/">coinbase.com</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://wallet.cex.io/">cex.io</a>
                        </li>
                        <li>
                            <a target="_blank" href="https://www.blockchain.com/wallet">blockchain.com</a>
                        </li>
                    </ul>
                    <p></p>`,
  },
  {
    title: "Is there a minimum Order?",
    html: `<p>
                        Yes. The minimum order is R$ 330.00.
                    </p>`,
  },
  {
    title: "What happends with my data?",
    html: `<p>
                        What we keep and for how long:
                    </p>
                    <table>
                        <tbody>
                            <tr>
                                <td style="padding-right:20px;">User, password, order history:</td>
                                <td>Until you delete your account.</td>
                            </tr>
                            <tr>
                                <td style="padding-right:20px;">Shipping address:</td>
                                <td>Shipping deadline plus 10 days.</td>
                            </tr>
                        </tbody>
                    </table>
                    <br> Data that could identify you (such as the receiver name and the shipping address) is kept encrypted (public and private key encryption).<br>
                    Our private key is also encrypted with a password.<br>
                    <b>In other words: if someone had access to your order data, they would need our private key and its password to decrypt your address.</b><br>
                    That is the highest security we can offer.
                    <p></p>`,
  },
  {
    title: "I have another question!",
    html: `<p>
                        We are here to help! Log in or create an account, open the support page and send us your message.
                    </p>`,
  },
];
export function productName(product: Product, lang: Lang): string {
  if (lang === "en") return product.name;
  return PRODUCT_NAMES_PT[product.id] ?? product.name;
}

export function categoryName(category: Category | undefined, lang: Lang): string {
  if (!category) return "";
  if (lang === "en") return category.name;
  return CATEGORY_NAMES_PT[category.id] ?? category.name;
}

/** O texto de estoque vem do catálogo (In stock / Out of stock) e do banco. */
export function productStockText(product: Product, lang: Lang): string {
  if (lang === "en") return product.stockText;
  return product.stock ? "Em estoque" : "Fora de estoque";
}

/** "Active seller" / "79 items" chegam como texto pronto do catálogo original. */
export function vendorRank(vendor: Vendor, lang: Lang): string {
  if (lang === "en") return vendor.rank;
  return vendor.rank === "Active seller" ? "Vendedor ativo" : vendor.rank;
}

export function vendorSelling(vendor: Vendor, lang: Lang): string {
  if (lang === "en") return vendor.selling;
  return vendor.selling.replace(/items/g, "itens");
}
