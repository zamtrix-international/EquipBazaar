function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + Number(hours));
  return d;
}

function nowISO() {
  return new Date().toISOString();
}

module.exports = { addHours, nowISO };