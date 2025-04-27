import config from '~/config';

// Layouts
import { HeaderOnly } from '~/layouts';

// Pages
import Home from '~/pages/Home';
import Following from '~/pages/Following';
import Profile from '~/pages/Profile';
import Upload from '~/pages/Upload';
import Search from '~/pages/Search';
import Live from '~/pages/Live';
import Login from '~/pages/Login';
import Messages from '~/pages/Messages';

// Public routes
const publicRoutes = [
    { path: config.routes.home, component: Home },
    { path: config.routes.following, component: Following },
    { path: config.routes.live, component: Live },
    { path: config.routes.profile, component: Profile, authRequired: true },
    { path: config.routes.upload, component: Upload, layout: HeaderOnly, authRequired: true },
    { path: config.routes.search, component: Search, layout: null },
    { path: config.routes.login, component: Login, layout: HeaderOnly },
    { path: config.routes.messages, component: Messages, layout: HeaderOnly, authRequired: true },
];

const privateRoutes = [];

export { publicRoutes, privateRoutes };