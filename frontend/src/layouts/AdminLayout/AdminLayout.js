import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useState } from 'react';
import styles from './AdminLayout.module.scss';
import Sidebar from '~/layouts/components/AdminSidebar';

const cx = classNames.bind(styles);

function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeMenu, setActiveMenu] = useState('Dashboard');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleMenuClick = (menu) => {
        setActiveMenu(menu);
        if (isSidebarOpen) toggleSidebar();
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    activeMenu={activeMenu}
                    handleMenuClick={handleMenuClick}
                />
                <main className={cx('content')}>{children}</main>
            </div>
        </div>
    );
}

AdminLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default AdminLayout;