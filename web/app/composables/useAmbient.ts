import { computed, watch, ref } from 'vue';
import { useAudio } from '~/composables/useAudio';

export const useAmbient = () => {
    const configStore = useConfig(); 
    const { playGoodAmbient, playDarkAmbient } = useAudio();
    const hasStarted = ref(false);
    
    const temperature = computed(() => {
        if (!configStore.isFormValidated) return null;
        return (
            configStore.worldStateSteps[configStore.currentStep]?.temperature + 27
        );
    });
    
    const startAmbient = () => {
        if (hasStarted.value) return;
        hasStarted.value = true;
        
        setTimeout(() => {
            playGoodAmbient();
        }, 100);
    };
    
    let transitionTimeout: NodeJS.Timeout | null = null;
    
    watch(
        temperature,
        (temp) => {
            if (!hasStarted.value || temp === null) return;
            
            if (transitionTimeout) clearTimeout(transitionTimeout);
            
            transitionTimeout = setTimeout(() => {
                if (temp > 29.5) {
                    playDarkAmbient();
                } else if (temp < 28.5) {
                    playGoodAmbient();
                }
            }, 200);
        },
        { flush: 'post' }
    );
    
    return { startAmbient };
};