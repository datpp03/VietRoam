import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { Link, useNavigate } from "react-router-dom";
import styles from './Sidebar.module.scss';
import config from "~/config";
import Image from "~/components/Image";
import { useAuth } from "~/contexts/AuthContext";
import { FaChartBar, FaUserCog, FaSignOutAlt, FaHome } from 'react-icons/fa'; // Added FaSignOutAlt for logout icon

const cx = classNames.bind(styles);

function Sidebar({ isSidebarOpen, toggleSidebar, activeMenu, handleMenuClick }) {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
 
  return (
    <aside className={cx('sidebar', { sidebarOpen: isSidebarOpen })}>
      <div className={cx('user-info')}>
        <Image
          className={cx('user-avatar')}
          src={user?.avatar || "https://files.fullstack.edu.vn/f8-prod/user_avatars/1/623d4b2d95cec.png"}
          alt={user?.name || "User"}
        />
        <span className={cx('name')}>{user?.name}</span>
      </div>
      <ul className={cx('menu')}>
        <li className={cx('menuItem')}>
          <Link
            to={config.adminRoutes.home}
            className={cx('menuLink', { active: activeMenu === 'statistics' })}
            onClick={() => handleMenuClick('statistics')}
          >
            <FaChartBar />
            <span>Statistics</span>
          </Link>
        </li>
        <li className={cx('menuItem')}>
          <Link
            to={config.adminRoutes.user}
            className={cx('menuLink', { active: activeMenu === 'account-management' })}
            onClick={() => handleMenuClick('account-management')}
          >
            <FaUserCog />
            <span>Account Management</span>
          </Link>
        </li>
        <li className={cx('menuItem', 'separate')}>
          <button
            className={cx('menuLink')}
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
          <Link
            to={config.routes.home}
            className={cx('menuLink')}
          >
            <FaHome />
            <span>Back Home</span>
          </Link>
        </li>
      </ul>
    </aside>
  );
}

Sidebar.propTypes = {
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func.isRequired,
  activeMenu: PropTypes.string.isRequired,
  handleMenuClick: PropTypes.func.isRequired,
};

export default Sidebar;