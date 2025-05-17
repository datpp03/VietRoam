/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import Image from '~/components/Image';
import Button from '~/components/Button';
import { Grid, Heart } from 'lucide-react';
import styles from './Profile.module.scss';
import PostList from '~/components/PostList';
import EditProfile from '~/components/EditProfile';
import { getProfileUser, followUser, unfollowUser, getUsersBatch } from '~/services/userService';
import { useAuth } from '~/contexts/AuthContext';
import { getPostsUser, getMyPosts, getLikedPosts } from '~/services/postService';

const cx = classNames.bind(styles);

function Profile() {
    const { user, following, token, login } = useAuth();
    const [activeTab, setActiveTab] = useState('posts');
    const { username } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [posts, setPosts] = useState([]);
    const [users, setUsers] = useState([]);
    const [postCache, setPostCache] = useState({ posts: [], liked: [] });
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isOwnProfile, setIsOwnProfile] = useState(false);

    useEffect(() => {
        setIsOwnProfile(user && profileData?._id && user.id === profileData._id.toString());
    }, [user, profileData]);

    useEffect(() => {
        // Reset trạng thái khi username thay đổi
        setLoading(true);
        setProfileLoading(true);
        setError(null);
        setPosts([]);
        setUsers([]);
        setPostCache({ posts: [], liked: [] });

        const fetchProfileData = async () => {
            try {
                const data = await getProfileUser(username, user ? token : '');
                setProfileData(data.user);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setError('Failed to load profile.');
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfileData();
    }, [username, token, user]);

    useEffect(() => {
        const fetchPosts = async () => {
            if (!profileData) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                setError(null);
                let fetchedPosts = [];
                let userIds = [];
                let userData = [];

                if (isOwnProfile && activeTab === 'liked') {
                    const likedPostsData = await getLikedPosts(profileData._id);
                    fetchedPosts = likedPostsData.posts || [];
                    setPostCache(prev => ({ ...prev, liked: fetchedPosts }));
                } else {
                    const postData = isOwnProfile
                        ? await getMyPosts(profileData._id, token)
                        : await getPostsUser(profileData._id, token);
                    fetchedPosts = postData.posts || [];
                    setPostCache(prev => ({ ...prev, posts: fetchedPosts }));
                }

                userIds = [...new Set(fetchedPosts.map(post => post.user_id))];
                try {
                    userData = await getUsersBatch(userIds, token);
                } catch (userError) {
                    console.error('Error fetching users:', userError);
                }
                setPosts(fetchedPosts);
                setUsers(userData.users || []);
            } catch (error) {
                console.error('Error fetching posts:', error);
                setError('Failed to load posts. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, [profileData, token, activeTab, isOwnProfile, username]);

    useEffect(() => {
        if (profileData && following) {
            setIsFollowing(following.includes(profileData._id.toString()));
        }
    }, [profileData, following]);

    if (profileLoading) {
        return <div>Loading profile...</div>;
    }

    if (!profileData) {
        return <div>Profile not found</div>;
    }

    const handleFollow = async () => {
        try {
            const response = await followUser(profileData._id, token);
            if (response.success) {
                const updatedFollowing = [...following, profileData._id.toString()];
                login(user, token, updatedFollowing);
                setIsFollowing(true);
                setProfileData({
                    ...profileData,
                    followers_count: profileData.followers_count + 1,
                });
            }
        } catch (error) {
            console.error('Error following user:', error);
        }
    };

    const handleUnfollow = async () => {
        try {
            const response = await unfollowUser(profileData._id, token);
            if (response.success) {
                const updatedFollowing = following.filter((id) => id !== profileData._id.toString());
                login(user, token, updatedFollowing);
                setIsFollowing(false);
                setProfileData({
                    ...profileData,
                    followers_count: profileData.followers_count - 1,
                });
            }
        } catch (error) {
            console.error('Error unfollowing user:', error);
        }
    };

    const handleUpdateProfile = (updatedUser) => {
        setProfileData(updatedUser);
    };

    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('container')}>
                    <div className={cx('header')}>
                        <Image className={cx('avatar')} src={profileData.profile_picture} alt={profileData.full_name} />
                        <div className={cx('info')}>
                            <h1 className={cx('name')}>{profileData.full_name}</h1>
                            <span className={cx('username')}>@{username}</span>
                        </div>
                        <div className={cx('actions')}>
                            {isOwnProfile ? (
                                <Button primary className={cx('action-btn')} onClick={() => setShowEditModal(true)}>
                                    Edit Profile
                                </Button>
                            ) : isFollowing ? (
                                <Button outline className={cx('action-btn')} onClick={handleUnfollow}>
                                    Unfollow
                                </Button>
                            ) : (
                                <Button primary className={cx('action-btn')} onClick={handleFollow}>
                                    Follow
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={cx('stats')}>
                        <div className={cx('stat-item')}>
                            <span className={cx('stat-value')}>{profileData.followers_count}</span>
                            <span className={cx('stat-label')}>Followers</span>
                        </div>
                        <div className={cx('stat-item')}>
                            <span className={cx('stat-value')}>{profileData.following_count}</span>
                            <span className={cx('stat-label')}>Following</span>
                        </div>
                    </div>

                    <div className={cx('bio')}>
                        <p>{profileData.bio || 'Chưa có bio'}</p>
                    </div>

                    <div className={cx('location')}>
                        <span>
                            {profileData.location?.city && profileData.location.city + ', '}
                            {profileData.location?.country}
                        </span>
                    </div>

                    <div className={cx('interests')}>
                        {profileData.travel_interests?.map((interest, index) => (
                            <span key={index} className={cx('interest-tag')}>
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {showEditModal && (
                <EditProfile
                    userData={profileData}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleUpdateProfile}
                />
            )}

            <div className={cx('content-tabs')}>
                <button
                    className={cx('tab-button', { active: activeTab === 'posts' })}
                    onClick={() => setActiveTab('posts')}
                >
                    <Grid size={20} />
                    <span>Bài viết</span>
                </button>
                {isOwnProfile && (
                    <button
                        className={cx('tab-button', { active: activeTab === 'liked' })}
                        onClick={() => setActiveTab('liked')}
                    >
                        <Heart size={20} />
                        <span>Đã thích</span>
                    </button>
                )}
            </div>

            <div className={cx('tab-content')}>
                {error && <div className={cx('error')}>{error}</div>}
                {activeTab === 'posts' && (
                    loading ? <div className={cx('loading')}>Loading posts...</div> : <PostList posts={posts} users={users} />
                )}
                {activeTab === 'liked' && (
                    loading ? <div className={cx('loading')}>Loading liked posts...</div> : <PostList posts={posts} users={users} />
                )}
            </div>
        </>
    );
}

export default Profile;