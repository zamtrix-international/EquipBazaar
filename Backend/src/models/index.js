const User = require("./User");
const RefreshToken = require("./RefreshToken");

const VendorProfile = require("./VendorProfile");
const VendorKycDocument = require("./VendorKycDocument");
const VendorBankAccount = require("./VendorBankAccount");

const Equipment = require("./Equipment");
const EquipmentImage = require("./EquipmentImage");
const EquipmentAvailability = require("./EquipmentAvailability");

const Booking = require("./Booking");
const BookingStatusLog = require("./BookingStatusLog");
const DeliveryConfirmation = require("./DeliveryConfirmation");

const Dispute = require("./Dispute");
const DisputeMessage = require("./DisputeMessage");
const DisputeAttachment = require("./DisputeAttachment");

const Payment = require("./Payment");
const PaymentGatewayConfig = require("./PaymentGatewayConfig");
const PaymentWebhookLog = require("./PaymentWebhookLog");

const VendorWallet = require("./VendorWallet");
const VendorWalletLedger = require("./VendorWalletLedger");
const WithdrawalRequest = require("./WithdrawalRequest");
const PayoutTransaction = require("./PayoutTransaction");

const CommissionRule = require("./CommissionRule");
const Review = require("./Review");

const SupportTicket = require("./SupportTicket");
const SupportMessage = require("./SupportMessage");
const SupportAttachment = require("./SupportAttachment");

const AppSetting = require("./AppSetting");
const AuditLog = require("./AuditLog");
const NotificationLog = require("./NotificationLog");
const ReportExport = require("./ReportExport");

// -------------------- Associations --------------------

// User ↔ RefreshToken (1:M)
User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });

// User ↔ VendorProfile (1:1)
User.hasOne(VendorProfile, { foreignKey: "userId", as: "vendorProfile" });
VendorProfile.belongsTo(User, { foreignKey: "userId", as: "user" });

// VendorProfile ↔ KYC docs (1:M)
VendorProfile.hasMany(VendorKycDocument, { foreignKey: "vendorId", as: "kycDocuments" });
VendorKycDocument.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// VendorProfile ↔ Bank accounts (1:M)
VendorProfile.hasMany(VendorBankAccount, { foreignKey: "vendorId", as: "bankAccounts" });
VendorBankAccount.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// VendorProfile ↔ Equipment (1:M)
VendorProfile.hasMany(Equipment, { foreignKey: "vendorId", as: "equipments" });
Equipment.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// Equipment ↔ Images (1:M)
Equipment.hasMany(EquipmentImage, { foreignKey: "equipmentId", as: "images" });
EquipmentImage.belongsTo(Equipment, { foreignKey: "equipmentId", as: "equipment" });

// Equipment ↔ Availability (1:M)
Equipment.hasMany(EquipmentAvailability, { foreignKey: "equipmentId", as: "availability" });
EquipmentAvailability.belongsTo(Equipment, { foreignKey: "equipmentId", as: "equipment" });

// Booking ↔ Equipment (M:1)
Equipment.hasMany(Booking, { foreignKey: "equipmentId", as: "bookings" });
Booking.belongsTo(Equipment, { foreignKey: "equipmentId", as: "equipment" });

// Booking ↔ Customer(User) (M:1)
User.hasMany(Booking, { foreignKey: "customerId", as: "customerBookings" });
Booking.belongsTo(User, { foreignKey: "customerId", as: "customer" });

// Booking ↔ VendorProfile (M:1)
VendorProfile.hasMany(Booking, { foreignKey: "vendorId", as: "vendorBookings" });
Booking.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// Booking ↔ StatusLogs (1:M)
Booking.hasMany(BookingStatusLog, { foreignKey: "bookingId", as: "statusLogs" });
BookingStatusLog.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// BookingStatusLog ↔ User (changedBy)
User.hasMany(BookingStatusLog, { foreignKey: "changedByUserId", as: "statusChanges" });
BookingStatusLog.belongsTo(User, { foreignKey: "changedByUserId", as: "changedBy" });

// Booking ↔ DeliveryConfirmation (1:1)
Booking.hasOne(DeliveryConfirmation, { foreignKey: "bookingId", as: "deliveryConfirmation" });
DeliveryConfirmation.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// Booking ↔ Dispute (1:1)
Booking.hasOne(Dispute, { foreignKey: "bookingId", as: "dispute" });
Dispute.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// Dispute ↔ Messages/Attachments
Dispute.hasMany(DisputeMessage, { foreignKey: "disputeId", as: "messages" });
DisputeMessage.belongsTo(Dispute, { foreignKey: "disputeId", as: "dispute" });

Dispute.hasMany(DisputeAttachment, { foreignKey: "disputeId", as: "attachments" });
DisputeAttachment.belongsTo(Dispute, { foreignKey: "disputeId", as: "dispute" });

// DisputeMessage ↔ User (sender)
User.hasMany(DisputeMessage, { foreignKey: "senderUserId", as: "disputeMessages" });
DisputeMessage.belongsTo(User, { foreignKey: "senderUserId", as: "sender" });

// Booking ↔ Payment (1:M) (supports retries)
Booking.hasMany(Payment, { foreignKey: "bookingId", as: "payments" });
Payment.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// VendorProfile ↔ Wallet (1:1)
VendorProfile.hasOne(VendorWallet, { foreignKey: "vendorId", as: "wallet" });
VendorWallet.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// Wallet ↔ Ledger (1:M)
VendorWallet.hasMany(VendorWalletLedger, { foreignKey: "vendorWalletId", as: "ledgerEntries" });
VendorWalletLedger.belongsTo(VendorWallet, { foreignKey: "vendorWalletId", as: "wallet" });

// VendorProfile ↔ WithdrawalRequest (1:M)
VendorProfile.hasMany(WithdrawalRequest, { foreignKey: "vendorId", as: "withdrawalRequests" });
WithdrawalRequest.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// WithdrawalRequest ↔ PayoutTransaction (1:1)
WithdrawalRequest.hasOne(PayoutTransaction, { foreignKey: "withdrawalRequestId", as: "payout" });
PayoutTransaction.belongsTo(WithdrawalRequest, { foreignKey: "withdrawalRequestId", as: "withdrawalRequest" });

// Booking ↔ Review (1:1) (review only after completed)
Booking.hasOne(Review, { foreignKey: "bookingId", as: "review" });
Review.belongsTo(Booking, { foreignKey: "bookingId", as: "booking" });

// VendorProfile ↔ Review (1:M)
VendorProfile.hasMany(Review, { foreignKey: "vendorId", as: "reviews" });
Review.belongsTo(VendorProfile, { foreignKey: "vendorId", as: "vendor" });

// Equipment ↔ Review (1:M)
Equipment.hasMany(Review, { foreignKey: "equipmentId", as: "reviews" });
Review.belongsTo(Equipment, { foreignKey: "equipmentId", as: "equipment" });

// Customer(User) ↔ Review (1:M)
User.hasMany(Review, { foreignKey: "customerId", as: "customerReviews" });
Review.belongsTo(User, { foreignKey: "customerId", as: "customer" });

// SupportTicket ↔ Messages/Attachments
SupportTicket.hasMany(SupportMessage, { foreignKey: "ticketId", as: "messages" });
SupportMessage.belongsTo(SupportTicket, { foreignKey: "ticketId", as: "ticket" });

SupportTicket.hasMany(SupportAttachment, { foreignKey: "ticketId", as: "attachments" });
SupportAttachment.belongsTo(SupportTicket, { foreignKey: "ticketId", as: "ticket" });

// SupportTicket ↔ User (creator)
User.hasMany(SupportTicket, { foreignKey: "createdByUserId", as: "supportTickets" });
SupportTicket.belongsTo(User, { foreignKey: "createdByUserId", as: "createdBy" });

// SupportMessage ↔ User (sender)
User.hasMany(SupportMessage, { foreignKey: "senderUserId", as: "supportMessages" });
SupportMessage.belongsTo(User, { foreignKey: "senderUserId", as: "sender" });

// NotificationLog ↔ User
User.hasMany(NotificationLog, { foreignKey: "userId", as: "notifications" });
NotificationLog.belongsTo(User, { foreignKey: "userId", as: "user" });

// AuditLog ↔ User (actor)
User.hasMany(AuditLog, { foreignKey: "actorUserId", as: "auditLogs" });
AuditLog.belongsTo(User, { foreignKey: "actorUserId", as: "actor" });

// ReportExport ↔ User (requester)
User.hasMany(ReportExport, { foreignKey: "requestedByUserId", as: "reportExports" });
ReportExport.belongsTo(User, { foreignKey: "requestedByUserId", as: "requestedBy" });

// -------------------- Export --------------------
module.exports = {
  User,
  RefreshToken,
  VendorProfile,
  VendorKycDocument,
  VendorBankAccount,
  Equipment,
  EquipmentImage,
  EquipmentAvailability,
  Booking,
  BookingStatusLog,
  DeliveryConfirmation,
  Dispute,
  DisputeMessage,
  DisputeAttachment,
  Payment,
  PaymentGatewayConfig,
  PaymentWebhookLog,
  VendorWallet,
  VendorWalletLedger,
  WithdrawalRequest,
  PayoutTransaction,
  CommissionRule,
  Review,
  SupportTicket,
  SupportMessage,
  SupportAttachment,
  AppSetting,
  AuditLog,
  NotificationLog,
  ReportExport,
};