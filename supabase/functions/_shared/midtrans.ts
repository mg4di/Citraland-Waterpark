export function mapMidtransStatus(
  transactionStatus: string | undefined,
  fraudStatus?: string,
): string | null {
  if (fraudStatus?.toLowerCase() === "deny") return "failed";
  switch (transactionStatus?.toLowerCase()) {
    case "settlement":
      return "paid";
    case "capture":
      return fraudStatus?.toLowerCase() === "accept" ? "paid" : "pending";
    case "pending":
      return "pending";
    case "deny":
    case "expire":
      return "failed";
    case "cancel":
      return "cancelled";
    case "refund":
    case "partial_refund":
      return "refunded";
    default:
      return null;
  }
}
