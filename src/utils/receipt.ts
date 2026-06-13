import { Order } from "../types";

// Generates an elegant print-friendly commercial layout simulating Guinée Market Pro official invoices
export function printReceipt(order: Order) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Veuillez autoriser les fenêtres contextuelles (popups) pour télécharger ou imprimer le reçu.");
    return;
  }

  const itemsRows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${item.price.toLocaleString()} GNF</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${(item.price * item.quantity).toLocaleString()} GNF</td>
    </tr>
  `
    )
    .join("");

  const formattedDate = new Date(order.createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const transactionId = `GMP-${Math.floor(Math.random() * 900000) + 100000}-OM`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Reçu Officiel - Guinée Market Pro</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.5; padding: 20px; }
        .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 14px; }
        .header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #009460; padding-bottom: 20px; margin-bottom: 25px; }
        .logo { font-size: 24px; font-weight: bold; color: #009460; }
        .logo span { color: #CE1126; }
        .flag { height: 10px; width: 60px; display: flex; margin-top: 5px; }
        .flag-red { background-color: #CE1126; flex: 1; }
        .flag-yellow { background-color: #FCD116; flex: 1; }
        .flag-green { background-color: #009460; flex: 1; }
        .meta-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .meta-col { flex: 1; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f9f9f9; text-align: left; padding: 10px; border-bottom: 2px solid #ddd; font-weight: bold; }
        .total-section { text-align: right; font-size: 16px; font-weight: bold; margin-bottom: 40px; }
        .footer { text-align: center; color: #777; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; }
        .stamp { display: inline-block; border: 3px double #009460; color: #009460; font-weight: bold; padding: 10px 15px; text-transform: uppercase; transform: rotate(-5deg); border-radius: 5px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <div class="header-bar">
          <div>
            <div class="logo">GUINÉE <span>MARKET PRO</span></div>
            <div class="flag">
              <div class="flag-red"></div>
              <div class="flag-yellow"></div>
              <div class="flag-green"></div>
            </div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #555;">REÇU OFFICIEL</h2>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #777;">Réf: ${order.id}</p>
          </div>
        </div>

        <div class="meta-info">
          <div class="meta-col">
            <strong>Émis par :</strong><br>
            Boutique de : ${order.sellerId === "seller_kindia_agri" ? "Syli Agro Kindia (M. Sylla)" : order.sellerId === "seller_madina_electro" ? "Diallo Madina Tech" : "Vendeur Certifié Guinée Market Pro"}<br>
            Marché de Madina / Conakry, Guinée<br>
            Support: partner-seller@guineemarketpro.gn
          </div>
          <div class="meta-col" style="text-align: right;">
            <strong>Adressé à :</strong><br>
            Client: ${order.buyerName}<br>
            Tél: ${order.buyerPhone || "Non renseigné"}<br>
            Lieu de livraison: ${order.deliveryAddress}<br>
            Date: ${formattedDate}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Désignation Article</th>
              <th style="text-align: center; width: 100px;">Quantité</th>
              <th style="text-align: right; width: 120px;">Prix Unitaire</th>
              <th style="text-align: right; width: 120px;">Total (GNF)</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div class="stamp">PAYÉ SECURISE</div><br>
            <p style="font-size: 11px; color: #666; margin-top: 10px;">
              Méthode: ${order.paymentMethod.toUpperCase()}<br>
              ID Opérateur: ${transactionId}<br>
              frais de commission inclus : 0.5%
            </p>
          </div>
          <div class="total-section">
            <p style="margin: 5px 0; font-size: 14px; font-weight: normal;">Sous-total : ${order.totalAmount.toLocaleString()} GNF</p>
            <p style="margin: 5px 0; font-size: 14px; font-weight: normal;">TVA (0%) : 0 GNF</p>
            <h3 style="margin: 10px 0 0 0; color: #009460; font-size: 20px;">Total Général : ${order.totalAmount.toLocaleString()} GNF</h3>
          </div>
        </div>

        <div class="footer">
          <p>Merci pour votre achat sur la plateforme Guinée Market Pro - Le leader du e-commerce en Guinée et en Afrique de l'Ouest.</p>
          <p>Direction Générale du Commerce Électronique, Kaloum, BP 501, Conakry - Guinée</p>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
