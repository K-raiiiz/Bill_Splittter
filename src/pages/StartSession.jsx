import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { FiPlus, FiTrash2, FiImage, FiArrowRight } from 'react-icons/fi';
import './StartSession.css';

const StartSession = () => {
    const navigate = useNavigate();
    const { participants, setParticipants, billImage, setBillImage, billDate, setBillDate } = useSession();

    const [names, setNames] = useState(
        participants.length > 0 ? participants.map(p => p.name) : ['', '']
    );
    const [error, setError] = useState('');

    const handleNameChange = (index, value) => {
        const newNames = [...names];
        newNames[index] = value;
        setNames(newNames);
        if (error) setError('');
    };

    const addParticipant = () => setNames([...names, '']);

    const removeParticipant = (index) => {
        if (names.length <= 2) return;
        const newNames = names.filter((_, i) => i !== index);
        setNames(newNames);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => setBillImage(event.target.result);
        reader.readAsDataURL(file);
    };

    const handleNext = () => {
        const validNames = names.filter(n => n.trim() !== '');
        if (validNames.length < 2) {
            setError('Please add at least 2 participants.');
            return;
        }

        // Save properly structured participants
        const participantData = validNames.map(name => ({
            id: crypto.randomUUID(),
            name: name.trim()
        }));

        setParticipants(participantData);
        navigate('/entry');
    };

    return (
        <Card className="animate-fade-in">
            <h2 style={{ marginBottom: '8px', textAlign: 'center' }}>Start Session</h2>
            <p style={{ marginBottom: '24px', textAlign: 'center' }}>Who's splitting the bill today?</p>

            {error && <div className="error-banner">{error}</div>}

            <div style={{ marginBottom: '20px' }}>
                <Input
                    type="date"
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="mb-0"
                />
            </div>

            <div className="participants-list">
                {names.map((name, idx) => (
                    <div key={idx} className="participant-item">
                        <Input
                            placeholder={`Participant ${idx + 1} Name`}
                            value={name}
                            onChange={(e) => handleNameChange(idx, e.target.value)}
                            className="mb-0"
                        />
                        {names.length > 2 && (
                            <Button
                                variant="danger"
                                size="md"
                                onClick={() => removeParticipant(idx)}
                                title="Remove Participant"
                                style={{ padding: '12px', marginTop: '4px' }}
                            >
                                <FiTrash2 />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button variant="glass" fullWidth onClick={addParticipant} className="add-participant-btn">
                <FiPlus /> Add Another Person
            </Button>

            <div className="bill-upload-section">
                <label className="upload-label">
                    <input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleImageUpload}
                        hidden
                    />
                    <div className="upload-box">
                        <FiImage size={24} />
                        <span>{billImage ? 'Bill Image Attached' : 'Upload Bill Photo (Optional, <5MB)'}</span>
                    </div>
                </label>
                {billImage && (
                    <div className="image-preview" style={{ backgroundImage: `url(${billImage})` }}>
                        <button className="remove-image-btn" onClick={() => setBillImage(null)}>
                            <FiTrash2 />
                        </button>
                    </div>
                )}
            </div>

            <Button fullWidth size="lg" onClick={handleNext}>
                Continue to Item Entry <FiArrowRight />
            </Button>
        </Card>
    );
};

export default StartSession;
