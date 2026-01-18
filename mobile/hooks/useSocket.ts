import { useEffect, useCallback, useState } from "react";
import { Socket } from "socket.io-client";

type ConfiguratorValues = {
    plane: number;
    transport: any;
    promptIA: number;
    meat: boolean;
    products: number;
    phone: any;
    energy: number;
    clothes: number;
};

type ResultData = {
    text: string;
    rank: string;
    globalPercentage?: number;
    userPercentages?: any;
} | null;

export function useConfiguratorSocket(
    socket: Socket | null,
    roomId: string,
    values: ConfiguratorValues
) {
    const [isConnected, setIsConnected] = useState(false);
    const [resultData, setResultData] = useState<ResultData>(null);

    // SOCKET LISTENERS
    useEffect(() => {
        if (!socket) return;

        setIsConnected(socket.connected);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);
        const onUpdateClient = (data: any) => {
            if (data.type === "RESULT_CALCULATED") {
                console.log("résultats reçus:", data.data);
                setResultData(data.data);
            }
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("update-client", onUpdateClient);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("update-client", onUpdateClient);
        };
    }, [socket]);

    // EMITTERS
    const emit = useCallback(
        (payload: any) => {
            if (!socket) return;

            socket.emit("action-client", {
                roomId,
                payload,
            });
        },
        [socket, roomId]
    );

    const sendReveal = useCallback(
        (overrides = {}) => {
            emit({
                type: "REVEAL",
                ...overrides,
            });
            console.log("REVEAL envoyé");
        },
        [emit]
    );

    const sendValidateForm = useCallback(() => {
        emit({
            type: "VALIDATE_FORM",
            data: {
                plane: Math.round(values.plane),
                transport: values.transport,
                promptIA: values.promptIA,
                meat: values.meat,
                products: Math.round(values.products),
                phone: values.phone,
                energy: values.energy,
                clothes: Math.round(values.clothes),
            },
        });
        console.log("VALIDATE_FORM envoyé");
    }, [emit, values]);

    const sendCameraMovement = useCallback(
        (type: string, value: number) => {
            emit({
                type,
                data: { strength: value },
            });
            console.log(type, value);
        },
        [emit]
    );

    const sendYearTarget = useCallback(
        (value: number) => {
            emit({
                type: "YEARS",
                data: { strength: value },
            });
            console.log("target year:", value);
        },
        [emit]
    );

    const sendShowResult = useCallback(() => {
        emit({ type: "END_EXPERIENCE" });
    }, [emit]);

    const sendCloseResult = useCallback(() => {
        emit({ type: "CLOSE_EXPLANATIONS" });
    }, [emit]);

    const sendShowExplanations = useCallback(() => {
        emit({ type: "SHOW_EXPLANATIONS" });
    }, [emit]);

    const sendChangeQuestion = useCallback(
        (questionIndex: number) => {
            emit({
                type: "CHANGE_QUESTION_EXPLANATION",
                data: { question: questionIndex },
            });
        }, [emit]
    );

    return {
        isConnected,
        resultData,
        sendReveal,
        sendValidateForm,
        sendCameraMovement,
        sendYearTarget,
        sendShowResult,
        sendCloseResult,
        sendShowExplanations,
        sendChangeQuestion,
    };
}
