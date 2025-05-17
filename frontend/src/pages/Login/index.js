import React, { useState, useEffect } from 'react';
import { useAuth } from '~/contexts/AuthContext';
import { auth, googleProvider } from '~/firebase';
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Login.module.scss';
import { loginWithGoogle } from '~/services/authService';
import images from '~/assets/images';

const cx = classNames.bind(styles);

function Login() {
  const [error, setError] = useState('');
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const data = await loginWithGoogle(idToken);
      
      login(data.user, data.token, data.following);
      navigate('/');
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Bạn đã đóng cửa sổ đăng nhập. Vui lòng thử lại.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Đăng nhập không thành công. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className={cx('wrapper')}>
      <div className={cx('container')}>
        <div className={cx('illustration-section')}>
          <img 
            src={images.logo2} 
            alt='Travel Blog Illustration'
            className={cx('illustration')}
          />
          <h2 className={cx('slogan')}>Khám phá thế giới qua những chuyến đi</h2>
        </div>

        <div className={cx('form-section')}>
          <div className={cx('login-card')}>
            <div className={cx('header')}>
              <h1 className={cx('title')}>
                <span className={cx('brand')}>VietRoam</span>
                <span className={cx('welcome-text')}>Chào mừng trở lại!</span>
              </h1>
              <p className={cx('subtitle')}>Đăng nhập để tiếp tục trải nghiệm</p>
            </div>

            {error && (
              <div className={cx('error-message')}>
                <FiAlertCircle className={cx('error-icon')} />
                {error}
              </div>
            )}

            <button 
              onClick={handleGoogleLogin} 
              className={cx('google-btn')}
            >
              <FcGoogle className={cx('google-icon')} />
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;