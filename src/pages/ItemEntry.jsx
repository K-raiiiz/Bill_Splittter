import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { FiPlus, FiTrash2, FiArrowRight, FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import './ItemEntry.css';

const ItemEntry = () => {
    const navigate = useNavigate();
    const { participants, items, setItems, extraCharges, setExtraCharges } = useSession();

    useEffect(() => {
        if (participants.length === 0) {
            navigate('/start');
        }

        // Initialize with one empty item if list is empty
        if (items.length === 0 && participants.length > 0) {
            setItems([{ id: crypto.randomUUID(), name: '', price: '', sharedBy: participants.map(p => p.id) }]);
        }
    }, [participants, navigate]);

    const updateItem = (itemId, field, value) => {
        setItems(items.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const toggleParticipantForItem = (itemId, participantId) => {
        setItems(items.map(item => {
            if (item.id === itemId) {
                const isShared = item.sharedBy.includes(participantId);
                const newSharedBy = isShared
                    ? item.sharedBy.filter(id => id !== participantId)
                    : [...item.sharedBy, participantId];
                return { ...item, sharedBy: newSharedBy };
            }
            return item;
        }));
    };

    const addItemRow = () => {
        setItems([...items, { id: crypto.randomUUID(), name: '', price: '', sharedBy: participants.map(p => p.id) }]);
    };

    const removeItemRow = (itemId) => {
        const newItems = items.filter(item => item.id !== itemId);
        if (newItems.length === 0) {
            newItems.push({ id: crypto.randomUUID(), name: '', price: '', sharedBy: participants.map(p => p.id) });
        }
        setItems(newItems);
    };

    const handleNext = () => {
        // Filter out completely empty items so they don't block the user
        const activeItems = items.filter(item => item.name.trim() !== '' || item.price !== '');

        // Check if any actively filled items have missing prices or no assignees
        const invalidItem = activeItems.find(item => item.sharedBy.length === 0 || !item.price);
        if (invalidItem) {
            alert(`Whoops! It looks like "${invalidItem.name || 'an item'}" is missing a price or hasn't been assigned to anyone. Please tap the name of the person(s) who shared it!`);
            return;
        }

        // If nothing was entered at all anywhere
        if (activeItems.length === 0 && extraCharges.length === 0) {
            alert("Please enter at least one food item or additional charge.");
            return;
        }

        // Clean empty ones out of state and navigate
        if (items.length !== activeItems.length && activeItems.length > 0) {
            setItems(activeItems);
        }
        navigate('/summary');
    };

    if (participants.length === 0) return null;

    return (
        <Card className="animate-fade-in item-entry-card">
            <div className="header-actions">
                <button className="back-btn" onClick={() => navigate('/start')}>
                    <FiArrowLeft /> Back
                </button>
                <span className="step-indicator">Step 2 of 3</span>
            </div>

            <h2 style={{ marginBottom: '8px' }}>Add Items</h2>
            <p style={{ marginBottom: '24px' }}>What did everyone order and who shared it?</p>

            <div className="global-items-list animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {items.map((item, idx) => (
                    <div key={item.id} className="item-row-container" style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <div className="item-row" style={{ marginBottom: '12px' }}>
                            <Input
                                placeholder="Item Name (e.g. Pizza)"
                                value={item.name}
                                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                                className="flex-2"
                                style={{ marginBottom: 0 }}
                            />
                            <div className="price-input-group">
                                <Input
                                    type="number"
                                    placeholder="Price"
                                    value={item.price}
                                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                    className="flex-1"
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                            <Button
                                variant="danger"
                                onClick={() => removeItemRow(item.id)}
                                style={{ padding: '12px', height: '100%' }}
                                title="Remove Item"
                            >
                                <FiTrash2 />
                            </Button>
                        </div>

                        <div className="shared-by-section">
                            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>Shared by:</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {participants.map(p => {
                                    const isSelected = item.sharedBy.includes(p.id);
                                    return (
                                        <button
                                            key={p.id}
                                            onClick={() => toggleParticipantForItem(item.id, p.id)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '16px',
                                                border: `1px solid ${isSelected ? 'var(--primary-color)' : 'rgba(255,255,255,0.2)'}`,
                                                background: isSelected ? 'rgba(79, 70, 229, 0.2)' : 'transparent',
                                                color: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                                                fontSize: '0.85rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {p.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="glass" onClick={addItemRow} className="add-item-btn" style={{ marginTop: '20px', marginBottom: '32px' }}>
                <FiPlus /> Add Another Food Item
            </Button>

            <div className="additional-charges-section" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '20px', borderRadius: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Additional Charges</h3>
                    <Button variant="glass" size="sm" onClick={() => setExtraCharges([...extraCharges, { id: crypto.randomUUID(), name: '', amount: '', assignedTo: 'proportional' }])}>
                        <FiPlus /> Add Charge
                    </Button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '16px' }}>Add Tax, Delivery, or Personal Parcel changes here.</p>

                <div>
                    {extraCharges.map((charge, idx) => (
                        <div key={charge.id} style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <select
                                value={charge.assignedTo}
                                onChange={(e) => {
                                    const newArr = [...extraCharges];
                                    newArr[idx].assignedTo = e.target.value;
                                    setExtraCharges(newArr);
                                }}
                                style={{
                                    flex: '1',
                                    padding: '12px',
                                    background: 'rgba(0,0,0,0.3)',
                                    color: 'white',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '8px',
                                    outline: 'none',
                                    minWidth: '100px'
                                }}
                            >
                                <option value="proportional">Split Proportionally</option>
                                <option value="equal">Split Equally</option>
                                <optgroup label="Assign to Person:">
                                    {participants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </optgroup>
                            </select>

                            <Input
                                placeholder="Name (e.g. Tax)"
                                value={charge.name}
                                onChange={(e) => {
                                    const newArr = [...extraCharges];
                                    newArr[idx].name = e.target.value;
                                    setExtraCharges(newArr);
                                }}
                                style={{ flex: '2', marginBottom: 0 }}
                            />

                            <Input
                                type="number"
                                placeholder="Amt"
                                value={charge.amount}
                                onChange={(e) => {
                                    const newArr = [...extraCharges];
                                    newArr[idx].amount = e.target.value;
                                    setExtraCharges(newArr);
                                }}
                                style={{ flex: '1', marginBottom: 0, minWidth: '80px' }}
                            />

                            <Button
                                variant="danger"
                                onClick={() => setExtraCharges(extraCharges.filter(c => c.id !== charge.id))}
                                style={{ padding: '12px' }}
                            >
                                <FiTrash2 />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="entry-footer">
                <Button fullWidth size="lg" onClick={handleNext}>
                    Calculate Total <FiArrowRight />
                </Button>
            </div>
        </Card>
    );
};

export default ItemEntry;
