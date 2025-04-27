import authRoutes from './authRoutes.js';
import messageRoutes from './messageRoutes';


function routes(app) {
    app.use("/api", authRoutes);
    app.use('/api/messages', messageRoutes);
}

export default routes;