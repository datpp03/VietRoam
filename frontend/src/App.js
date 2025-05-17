// App.js
import { Fragment } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { publicRoutes, ProtectedRoute, adminRoutes } from '~/routes';
import { DefaultLayout, AdminLayout } from '~/layouts';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          {publicRoutes.map((route) => {
            const Page = route.component;
            let Layout = DefaultLayout;

            if (route.layout) {
              Layout = route.layout;
            } else if (route.layout === null) {
              Layout = Fragment;
            }

            return (
              <Route
                key={route.path} // Use route.path for a stable key
                path={route.path}
                element={
                  <ProtectedRoute authRequired={route.authRequired}>
                    <Layout>
                      <Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          })}

          {/* Admin Routes */}
          {adminRoutes.map((route) => {
            const Page = route.component;
            let Layout = AdminLayout; // Default to AdminLayout for admin routes

            if (route.layout) {
              Layout = route.layout;
            } else if (route.layout === null) {
              Layout = Fragment;
            }

            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <ProtectedRoute adminAuthRequired>
                    <Layout>
                      <Page />
                    </Layout>
                  </ProtectedRoute>
                }
              />
            );
          })}
        </Routes>
      </div>
    </Router>
  );
}

export default App;