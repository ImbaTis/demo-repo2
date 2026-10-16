const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const date = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatCurrency = (value: number | null | undefined) =>
  value == null ? "—" : currency.format(value);

export const formatDate = (d: Date) => date.format(d);

export const formatDateTime = (d: Date) => dateTime.format(d);
