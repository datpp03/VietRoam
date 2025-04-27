import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Header from '~/layouts/components/Header';
import MessagesSidebar from '~/layouts/components/MessagesSidebar';
import styles from './MessagesLayout.module.scss';

const cx = classNames.bind(styles);

function MessagesLayout({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <MessagesSidebar />
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

MessagesLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default MessagesLayout;
