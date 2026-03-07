import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
    const [participants, setParticipants] = useState([]);
    const [billImage, setBillImage] = useState(null);
    const [items, setItems] = useState([]); // [{ id, name, price, sharedBy: [participantIds] }]
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [extraCharges, setExtraCharges] = useState([]); // [{id, name, amount, assignedTo: 'proportional' | 'equal' | participantId }]
    const [paymentInfo, setPaymentInfo] = useState({ receiver: '', qrImage: null });

    const value = {
        participants,
        setParticipants,
        billImage,
        setBillImage,
        items,
        setItems,
        billDate,
        setBillDate,
        extraCharges,
        setExtraCharges,
        paymentInfo,
        setPaymentInfo,
        resetSession: () => {
            setParticipants([]);
            setBillImage(null);
            setItems([]);
            setBillDate(new Date().toISOString().split('T')[0]);
            setExtraCharges([]);
            setPaymentInfo({ receiver: '', qrImage: null });
        }
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};
