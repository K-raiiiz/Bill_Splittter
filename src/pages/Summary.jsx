import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { FiImage, FiTrash2, FiRefreshCcw, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './Summary.css';

const Summary = () => {
    const navigate = useNavigate();
    const { participants, items, paymentInfo, setPaymentInfo, resetSession, extraCharges, billDate, billImage } = useSession();
    const [totals, setTotals] = useState([]);

    useEffect(() => {
        if (participants.length === 0) {
            navigate('/start');
            return;
        }

        // Calculate total food cost for proportional tax splitting
        const totalFoodCost = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

        // Calculate the Global Tax and Equal Extra Charges
        const proportionalCharges = extraCharges.filter(c => c.assignedTo === 'proportional').reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);
        const equalCharges = extraCharges.filter(c => c.assignedTo === 'equal').reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

        const equalSharePerPerson = participants.length > 0 ? equalCharges / participants.length : 0;

        const calculatedTotals = participants.map(p => {
            // Find all items this participant is sharing
            const myItems = items.filter(item => item.sharedBy && item.sharedBy.includes(p.id));

            // For each item, add the proportional cost: (item price / number of people sharing it)
            const foodSubtotal = myItems.reduce((acc, curr) => {
                const price = parseFloat(curr.price) || 0;
                const splitNum = curr.sharedBy.length || 1;
                return acc + (price / splitNum);
            }, 0);

            // Proportional Extra Charges (e.g. Tax)
            const myProportionalShare = totalFoodCost > 0 ? (foodSubtotal / totalFoodCost) * proportionalCharges : 0;

            // Extra Charges specifically assigned to this person (e.g., parcel)
            const myExtraCharges = extraCharges
                .filter(charge => charge.assignedTo === p.id)
                .reduce((sum, charge) => sum + (parseFloat(charge.amount) || 0), 0);

            const total = foodSubtotal + myProportionalShare + equalSharePerPerson + myExtraCharges;

            return { ...p, total, foodSubtotal, myProportionalShare, equalSharePerPerson, myExtraCharges, myItems };
        });

        setTotals(calculatedTotals);
    }, [participants, items, extraCharges, navigate]);

    const handleQRUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('QR Image must be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => setPaymentInfo({ ...paymentInfo, qrImage: event.target.result });
        reader.readAsDataURL(file);
    };

    const handleStartNew = () => {
        resetSession();
        navigate('/start');
    };

    const handleFinishAndSave = () => {
        try {
            const billData = {
                id: crypto.randomUUID(),
                date: billDate,
                timestamp: new Date().toISOString(),
                totalAmount: totals.reduce((acc, curr) => acc + curr.total, 0),
                participants: totals,
                items,
                extraCharges,
                paymentInfo: { receiver: paymentInfo.receiver } // Don't save large images to localStorage
            };

            const existingHistory = JSON.parse(localStorage.getItem('billSplitHistory') || '[]');
            localStorage.setItem('billSplitHistory', JSON.stringify([billData, ...existingHistory]));

            alert('Summary saved successfully to your local history! You can share this screen or let friends scan the QR.');
        } catch (error) {
            console.error('Error saving to local storage:', error);
            alert('Failed to save history to local storage.');
        }
    };

    if (participants.length === 0) return null;

    const grandTotal = totals.reduce((acc, curr) => acc + curr.total, 0);

    return (
        <Card className="animate-fade-in summary-card">
            <div className="header-actions">
                <button className="back-btn" onClick={() => navigate('/entry')}>
                    <FiArrowLeft /> Edit Items
                </button>
                <span className="step-indicator">Step 3 of 3</span>
            </div>

            <div className="text-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ marginBottom: '8px' }}>Final Summary</h2>
                <p>Total Bill: <strong style={{ color: 'white', fontSize: '1.2rem' }}>₹{grandTotal.toFixed(2)}</strong></p>
            </div>

            <div className="totals-list">
                {totals.map(p => (
                    <div key={p.id} className="total-item-container">
                        <div className="total-item">
                            <span className="person-name">{p.name}</span>
                            <span className="person-amount">₹{p.total.toFixed(2)}</span>
                        </div>
                        {p.myItems && p.myItems.length > 0 && (
                            <div className="person-items-list print-only-list">
                                {p.myItems.map(item => {
                                    const shareNum = item.sharedBy.length || 1;
                                    const itemPrice = parseFloat(item.price) || 0;
                                    const sharePrice = itemPrice / shareNum;
                                    const shareText = shareNum === 1 ? "1" : `1/${shareNum}`;

                                    return (
                                        <div key={item.id} className="person-item-row">
                                            <span>{item.name || 'Unnamed Item'} (Qty: {shareText})</span>
                                            <span>₹{sharePrice.toFixed(2)}</span>
                                        </div>
                                    );
                                })}

                                {(p.myProportionalShare > 0 || p.equalSharePerPerson > 0 || p.myExtraCharges > 0) && (
                                    <div className="person-item-row extra-charges-row">
                                        <span>+ Extra Charges & Tax</span>
                                        <span>₹{(p.myProportionalShare + p.equalSharePerPerson + p.myExtraCharges).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="payment-section">
                <h3>Payment Info</h3>
                <Input
                    placeholder="Receiver Name (e.g. Rahul)"
                    value={paymentInfo.receiver}
                    onChange={(e) => setPaymentInfo({ ...paymentInfo, receiver: e.target.value })}
                />

                <label className="upload-label">
                    <input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleQRUpload}
                        hidden
                    />
                    <div className="upload-box">
                        <FiImage size={24} />
                        <span>{paymentInfo.qrImage ? 'QR Code Attached' : 'Upload Payment QR Code'}</span>
                    </div>
                </label>

                {paymentInfo.qrImage && (
                    <div className="qr-preview-container">
                        <div className="qr-preview" style={{ backgroundImage: `url(${paymentInfo.qrImage})` }}>
                            <button className="remove-image-btn" onClick={() => setPaymentInfo({ ...paymentInfo, qrImage: null })}>
                                <FiTrash2 />
                            </button>
                        </div>
                        {paymentInfo.receiver && <p className="receiver-text">Pay {paymentInfo.receiver}</p>}
                    </div>
                )}
            </div>

            <div className="print-only-images" style={{ display: 'none' }}>
                {billImage && (
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <h3 style={{ borderBottom: '1px solid black', display: 'inline-block', paddingBottom: '4px' }}>Original Bill Photo</h3>
                        <img src={billImage} alt="Bill" style={{ maxWidth: '100%', maxHeight: '500px', display: 'block', margin: '16px auto', objectFit: 'contain' }} />
                    </div>
                )}
                {paymentInfo.qrImage && (
                    <div style={{ marginTop: '32px', textAlign: 'center' }}>
                        <h3 style={{ borderBottom: '1px solid black', display: 'inline-block', paddingBottom: '4px' }}>Scan to Pay {paymentInfo.receiver}</h3>
                        <img src={paymentInfo.qrImage} alt="QR Code" style={{ maxWidth: '250px', display: 'block', margin: '16px auto' }} />
                    </div>
                )}
            </div>

            <div className="summary-footer">
                <Button variant="primary" fullWidth size="lg" onClick={handleFinishAndSave}>
                    <FiCheckCircle /> Finish & Save
                </Button>
                <Button variant="glass" fullWidth onClick={() => window.print()} style={{ marginTop: '16px' }}>
                    Print Report
                </Button>
                <Button variant="glass" fullWidth onClick={handleStartNew} style={{ marginTop: '16px' }}>
                    <FiRefreshCcw /> Start New Bill
                </Button>
            </div>
        </Card>
    );
};

export default Summary;
