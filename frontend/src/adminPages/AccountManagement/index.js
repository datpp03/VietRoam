/* eslint-disable no-unused-vars */
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './AccountManagement.module.scss';
import { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaLock, FaUnlock, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import { debounce } from 'lodash';
import Modal from 'react-modal';
import { useAuth } from '~/contexts/AuthContext';
import { searchAllUsers, toggleVerification, getCountries, getCities } from '~/services/userService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const cx = classNames.bind(styles);

Modal.setAppElement('#root');

function AccountManagement() {
    const { user, token } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [users, setUsers] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalAction, setModalAction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [cities, setCities] = useState([]);

    // Lấy danh sách quốc gia khi component mount
    useEffect(() => {
        const fetchCountries = async () => {
            const countryList = await getCountries();
            setCountries(countryList);
        };
        fetchCountries();
    }, []);

    // Lấy danh sách thành phố khi quốc gia thay đổi
    useEffect(() => {
        if (selectedUser?.location?.country) {
            const fetchCities = async () => {
                const cityList = await getCities(selectedUser.location.country);
                setCities(cityList);
            };
            fetchCities();
        } else {
            setCities([]);
        }
    }, [selectedUser?.location?.country]);

    // Lấy danh sách người dùng
    useEffect(() => {
        if (user && user?.role) return; // Chỉ admin mới được xem danh sách
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const response = await searchAllUsers({ q: '' });
                if (response.success) {
                    setUsers(response.users);
                    if (response.users.length === 0) {
                        toast.info('Không tìm thấy người dùng nào');
                    }
                } else {
                    toast.error(response.message || 'Không thể tải danh sách người dùng');
                }
            } catch (error) {
                toast.error('Lỗi khi tải danh sách người dùng');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [user]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (value) => {
            setSearchTerm(value);
            if (user && user?.role) return;
            try {
                setIsLoading(true);
                console.log('Searching for:', value);
                
                const response = await searchAllUsers({ q: value });
                if (response.success) {
                    setUsers(response.users);
                    if (response.users.length === 0 && value) {
                        toast.info('Không tìm thấy người dùng phù hợp');
                    }
                } else {
                    toast.error(response.message || 'Không thể tìm kiếm người dùng');
                }
            } catch (error) {
                toast.error('Lỗi khi tìm kiếm người dùng');
            } finally {
                setIsLoading(false);
            }
        }, 500),
        [user]
    );

    const handleSearch = (e) => {
        debouncedSearch(e.target.value);
    };

    const openModal = (user, action) => {
        setSelectedUser(user);
        setModalAction(action);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setSelectedUser(null);
        setModalAction('');
    };

    const handleToggleVerification = async () => {
        setIsLoading(true);
        try {
            const response = await toggleVerification(selectedUser._id, token);
            if (response.success) {
                setUsers(users.map(u => u._id === selectedUser._id ? response.user : u));
                toast.success(response.message);
                closeModal();
            } else {
                toast.error(response.message || 'Không thể thay đổi trạng thái tài khoản');
            }
        } catch (error) {
            toast.error('Lỗi khi thay đổi trạng thái tài khoản');
        } finally {
            setIsLoading(false);
        }
    };

    if (user && user?.role) {
        return <div className={cx('error')}>Chỉ admin mới có quyền truy cập trang này</div>;
    }

    return (
        <div className={cx('user-management')}>
            <header className={cx('header')}>
                <h1>Quản lý tài khoản</h1>
                <div className={cx('search-bar')}>
                    <FaSearch className={cx('search-icon')} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên hoặc email..."
                        onChange={handleSearch}
                    />
                </div>
            </header>
            <div className={cx('table-container')}>
                {isLoading && <div className={cx('loading')}>Đang tải...</div>}
                {!isLoading && users.length === 0 && (
                    <div className={cx('no-results')}>Không tìm thấy người dùng nào</div>
                )}
                <table className={cx('user-table')}>
                    <thead>
                        <tr>
                            <th>Ảnh đại diện</th>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Quyền</th>
                            <th>Xác minh</th>
                            <th>Địa điểm</th>
                            <th>Sở thích</th>
                            <th>Theo dõi</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>
                                    <img
                                        src={user.profile_picture}
                                        alt={user.full_name}
                                        className={cx('avatar')}
                                    />
                                </td>
                                <td>
                                    <div className={cx('user-name')}>
                                        {user.full_name}
                                        <FaInfoCircle
                                            className={cx('info-icon')}
                                            title={user.bio || 'Không có mô tả'}
                                        />
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={cx('role', { admin: !user.role })}>
                                        {!user.role ? 'Admin' : 'User'}
                                    </span>
                                </td>
                                <td>
                                    {user.is_verified ? (
                                        <FaCheckCircle className={cx('verified')} />
                                    ) : (
                                        <FaTimesCircle className={cx('unverified')} />
                                    )}
                                </td>
                                <td>
                                    {user.location?.city}, {user.location?.country}
                                </td>
                                <td>
                                    <div className={cx('interests')}>
                                        {user.travel_interests?.join(', ')}
                                    </div>
                                </td>
                                <td>
                                    <div className={cx('follow-stats')}>
                                        <span>{user.followers_count} followers</span>
                                        <span>{user.following_count} following</span>
                                    </div>
                                </td>
                                <td>
                                    <div className={cx('action-buttons')}>
                                        {user && user.role && (
                                             <button
                                             className={cx('action-btn', user.is_verified ? 'lock' : 'unlock')}
                                             onClick={() => openModal(user, user.is_verified ? 'lock' : 'unlock')}
                                         >
                                             {user.is_verified ? <FaLock /> : <FaUnlock />}
                                             {user.is_verified ? 'Khóa' : 'Mở khóa'}
                                         </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                className={cx('modal')}
                overlayClassName={cx('modal-overlay')}
            >
                {(modalAction === 'lock' || modalAction === 'unlock') && (
                    <>
                        <h2>{modalAction === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}</h2>
                        <p>
                            Bạn có chắc muốn {modalAction === 'lock' ? 'khóa' : 'mở khóa'} tài khoản của {selectedUser?.full_name}?
                        </p>
                        <div className={cx('modal-buttons')}>
                            <button
                                className={cx('modal-btn', 'cancel')}
                                onClick={closeModal}
                                disabled={isLoading}
                            >
                                Hủy
                            </button>
                            <button
                                className={cx('modal-btn', modalAction === 'lock' ? 'lock' : 'unlock')}
                                onClick={handleToggleVerification}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Đang xử lý...' : (modalAction === 'lock' ? 'Khóa' : 'Mở khóa')}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
            <ToastContainer />
        </div>
    );
}

AccountManagement.propTypes = {
    children: PropTypes.node,
};

export default AccountManagement;