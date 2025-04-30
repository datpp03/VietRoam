import authRoutes from "./authRoutes";
import messageRoutes from "./messageRoutes";
import userRoutes from "./userRoutes";

export default (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/users", userRoutes);
};