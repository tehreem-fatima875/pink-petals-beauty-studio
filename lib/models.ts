import { model, models, Schema, Types, type Model } from "mongoose";

export type StoredAppointment = {
  _id: Types.ObjectId;
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  startsAt: Date;
  endsAt: Date;
  notes: string;
  status: "confirmed" | "cancelled" | "completed";
  source: "website" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

const appointmentSchema = new Schema<StoredAppointment>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true, maxlength: 80 },
    customerEmail: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
    customerPhone: { type: String, required: true, trim: true, maxlength: 30 },
    serviceId: { type: String, required: true, index: true },
    serviceName: { type: String, required: true },
    staffId: { type: String, required: true, index: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    notes: { type: String, trim: true, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
      index: true,
    },
    source: { type: String, enum: ["website", "admin"], default: "website" },
  },
  { timestamps: true },
);

appointmentSchema.index({ staffId: 1, startsAt: 1, status: 1 });
appointmentSchema.index({ customerEmail: 1, startsAt: -1 });

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "staff"], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const reservationSchema = new Schema(
  {
    reservationId: { type: String, required: true, index: true },
    staffId: { type: String, required: true },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
  },
  { timestamps: true },
);
reservationSchema.index({ staffId: 1, startsAt: 1 }, { unique: true });
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AppointmentModel: Model<StoredAppointment> =
  (models.Appointment as Model<StoredAppointment> | undefined) ??
  model<StoredAppointment>("Appointment", appointmentSchema);
export const UserModel = models.User || model("User", userSchema);
export const ReservationModel =
  models.Reservation || model("Reservation", reservationSchema);
