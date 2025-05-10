import authRoutes from "./authRoutes";
import messageRoutes from "./messageRoutes";
import userRoutes from "./userRoutes";
import postRoutes from './postRoutes.js';
import notificationRoutes from './notificationRoutes.js';
export default (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/users", userRoutes);
  app.use('/api', postRoutes);
  app.use('/api', notificationRoutes);
};