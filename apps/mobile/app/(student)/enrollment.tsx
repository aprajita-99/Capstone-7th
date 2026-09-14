import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator } from 'react-native';
import { FaceAPI } from '../../src/api/client';
import { CameraAbstraction } from '../../src/components/CameraAbstraction';

export default function EnrollmentScreen() {
    const [state, setState] = useState<'IDLE' | 'CHALLENGE_ACTIVE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMsg, setErrorMsg] = useState('');
    const [activeChallenge, setActiveChallenge] = useState<string | null>(null);

    const checkStatus = async () => {
        try {
            const res = await FaceAPI.getEnrollmentStatus();
            if (res.data.data.faceEnrolled) setState('SUCCESS');
        } catch (e: any) {
            setErrorMsg(e.message);
            setState('ERROR');
        }
    };

    useEffect(() => { checkStatus(); }, []);

    const startEnrollment = async () => {
        setState('IDLE');
        try {
            const res = await FaceAPI.initEnrollment();
            setActiveChallenge(res.data.data.challenge);
            setState('CHALLENGE_ACTIVE');
        } catch (e: any) {
            setErrorMsg(e.response?.data?.error?.message || e.message);
            setState('ERROR');
        }
    };

    const handleFaceCaptured = async (facePayload: string) => {
        if (!activeChallenge) return;
        setState('SUBMITTING');
        try {
            await FaceAPI.completeEnrollment(activeChallenge, facePayload);
            setState('SUCCESS');
        } catch (e: any) {
            setErrorMsg(e.response?.data?.error?.message || e.message);
            setState('ERROR');
        }
    };

    const deleteEnrollment = async () => {
        await FaceAPI.deleteEnrollment();
        setState('IDLE');
        setActiveChallenge(null);
    };

    if (state === 'IDLE') {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Face Enrollment</Text>
                <Button title="Start Enrollment" onPress={startEnrollment} />
            </View>
        );
    }

    if (state === 'CHALLENGE_ACTIVE') {
        return <CameraAbstraction mode="ENROLL" onCaptureFace={handleFaceCaptured} />;
    }

    if (state === 'SUBMITTING') {
         return <View style={styles.container}><ActivityIndicator size="large" /><Text>Processing Enrollment securely...</Text></View>;
    }

    if (state === 'SUCCESS') {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Enrollment Complete!</Text>
                <Text style={styles.subtitle}>Your face matrix is securely mapped.</Text>
                <Button color="red" title="Delete & Reset Binding" onPress={deleteEnrollment} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Error</Text>
            <Text style={styles.error}>{errorMsg}</Text>
            <Button title="Retry Enrollment" onPress={startEnrollment} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
    subtitle: { fontSize: 16, marginBottom: 40 },
    error: { color: 'red', textAlign: 'center', marginBottom: 20 }
});
