import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import Image from '~/components/Image';
import styles from './AccountItem.module.scss';

const cx = classNames.bind(styles);

function AccountItem({ data }) {
    // Extract username from email (characters before @)
    const username = data.email.split('@')[0];
    
    return (
        <Link to={`/@${username}`} className={cx('wrapper')}>
            <Image className={cx('avatar')} src={data.profile_picture} alt={data.full_name} />
            <div className={cx('info')}>
                <h4 className={cx('name')}>
                    <span>{data.full_name}</span>
                </h4>
                <span className={cx('username')}>{username}</span>
            </div>
        </Link>
    );
}

AccountItem.propTypes = {
    data: PropTypes.object.isRequired,
};

export default AccountItem;