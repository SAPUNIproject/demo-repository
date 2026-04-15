import { useRef, useState } from "react";
import "./Profile.css";

export default function Profile() {
    const [avatar, setAvatar] = useState(null);
    const [username, setUsername] = useState("admin");
    const [email, setEmail] = useState("admin@email.com");
    const [bio, setBio] = useState("System administrator");
    const [message, setMessage] = useState("");

    const fileInputRef = useRef(null);

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);
        setAvatar(imageUrl);
    };

    const handleSaveProfile = () => {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
    };

    return (
        <div className="profile-page">
            <div className="profile-card">
                <h2>Profile</h2>
                <p>Manage your profile information.</p>

                {message && <div className="profile-success">{message}</div>}

                <div className="avatar-section">
                    <div className="profile-avatar" onClick={handleAvatarClick}>
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="avatar-image" />
                        ) : (
                            <span>A</span>
                        )}
                    </div>

                    <button className="avatar-btn" onClick={handleAvatarClick}>
                        Upload Avatar
                    </button>

                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden-input"
                        onChange={handleAvatarChange}
                    />
                </div>

                <div className="profile-group">
                    <label>Username</label>
                    <input
                        className="profile-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="profile-group">
                    <label>Email</label>
                    <input
                        className="profile-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="profile-group">
                    <label>Bio</label>
                    <textarea
                        className="profile-textarea"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                    />
                </div>

                <button className="profile-save-btn" onClick={handleSaveProfile}>
                    Save Profile
                </button>
            </div>
        </div>
    );
}