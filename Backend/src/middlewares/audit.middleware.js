// Placeholder now; later we will write AuditLog model + saving logic.
function audit(action) {
  return (req, res, next) => {
    req.audit = { action };
    next();
  };
}

module.exports = { audit };