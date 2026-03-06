function toMoney(n) {
  const num = Number(n || 0);
  return Math.round(num * 100) / 100;
}

function calcCommission(totalAmount, commissionPct) {
  const total = toMoney(totalAmount);
  const pct = toMoney(commissionPct);
  const commission = toMoney((total * pct) / 100);
  const vendorNet = toMoney(total - commission);
  return { total, commissionPct: pct, commissionAmount: commission, vendorNetAmount: vendorNet };
}

module.exports = { toMoney, calcCommission };