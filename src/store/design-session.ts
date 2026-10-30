'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  BrandAnalysis,
  DesignConfig,
  DesignSessionStep,
  SessionState,
} from '@/lib/types';
import { applyDesignPatch } from '@/lib/sticker/apply-changes';
import { PRODUCT_COPY } from '@/lib/sticker/defaults';

const STORAGE_KEY = 'salon-bottle-session';

const initialSessionState: SessionState = {
  logoDataUrl: null,
  logoFileName: null,
  brandAnalysis: null,
  designs: [],
  selectedDesignIndex: 0,
  currentConfig: null,
  configHistory: [],
  historyIndex: -1,
  shampooConfig: null,
  conditionerConfig: null,
  includeConditioner: false,
  approved: false,
  salonName: 'Beauty Salon',
  step: 'welcome',
};

function pushHistory(
  history: DesignConfig[],
  historyIndex: number,
  config: DesignConfig,
): { configHistory: DesignConfig[]; historyIndex: number } {
  const truncated = history.slice(0, historyIndex + 1);
  truncated.push(config);
  return { configHistory: truncated, historyIndex: truncated.length - 1 };
}

export interface DesignSessionStore extends SessionState {
  setLogo: (dataUrl: string, fileName: string) => void;
  setBrandAnalysis: (analysis: BrandAnalysis) => void;
  setDesigns: (designs: DesignConfig[]) => void;
  selectDesign: (index: number) => void;
  updateConfig: (partial: Partial<DesignConfig>) => void;
  undo: () => void;
  redo: () => void;
  resetConfig: () => void;
  setIncludeConditioner: (include: boolean) => void;
  approve: () => void;
  setSalonName: (name: string) => void;
  setStep: (step: DesignSessionStep) => void;
  clearSession: () => void;
  createMatchingConditioner: () => void;
}

export const useDesignSessionStore = create<DesignSessionStore>()(
  persist(
    (set, get) => ({
      ...initialSessionState,

      setLogo: (dataUrl, fileName) =>
        set({ logoDataUrl: dataUrl, logoFileName: fileName }),

      setBrandAnalysis: (analysis) => set({ brandAnalysis: analysis }),

      setDesigns: (designs) => {
        const first = designs[0] ?? null;
        set({
          designs,
          selectedDesignIndex: 0,
          currentConfig: first,
          configHistory: first ? [first] : [],
          historyIndex: first ? 0 : -1,
          shampooConfig: first,
        });
      },

      selectDesign: (index) => {
        const { designs } = get();
        const config = designs[index];
        if (!config) return;
        set({
          selectedDesignIndex: index,
          currentConfig: config,
          configHistory: [config],
          historyIndex: 0,
          shampooConfig: config,
          approved: false,
        });
      },

      updateConfig: (partial) => {
        const state = get();
        if (!state.currentConfig) return;
        const next = applyDesignPatch(state.currentConfig, partial);
        const { configHistory, historyIndex } = pushHistory(
          state.configHistory,
          state.historyIndex,
          next,
        );
        const productType = next.productType;
        set({
          currentConfig: next,
          configHistory,
          historyIndex,
          approved: false,
          ...(productType === 'shampoo' ? { shampooConfig: next } : {}),
          ...(productType === 'conditioner' ? { conditionerConfig: next } : {}),
          designs: state.designs.map((d, i) =>
            i === state.selectedDesignIndex ? next : d,
          ),
        });
      },

      undo: () => {
        const { configHistory, historyIndex, currentConfig } = get();
        if (historyIndex <= 0 || !currentConfig) return;
        const newIndex = historyIndex - 1;
        const config = configHistory[newIndex];
        set({
          historyIndex: newIndex,
          currentConfig: config,
          shampooConfig:
            config.productType === 'shampoo' ? config : get().shampooConfig,
          conditionerConfig:
            config.productType === 'conditioner' ?
              config
            : get().conditionerConfig,
        });
      },

      redo: () => {
        const { configHistory, historyIndex } = get();
        if (historyIndex >= configHistory.length - 1) return;
        const newIndex = historyIndex + 1;
        const config = configHistory[newIndex];
        set({
          historyIndex: newIndex,
          currentConfig: config,
          shampooConfig:
            config.productType === 'shampoo' ? config : get().shampooConfig,
          conditionerConfig:
            config.productType === 'conditioner' ?
              config
            : get().conditionerConfig,
        });
      },

      resetConfig: () => {
        const { designs, selectedDesignIndex } = get();
        const base = designs[selectedDesignIndex];
        if (!base) return;
        set({
          currentConfig: base,
          configHistory: [base],
          historyIndex: 0,
          shampooConfig: base.productType === 'shampoo' ? base : get().shampooConfig,
          approved: false,
        });
      },

      setIncludeConditioner: (include) => {
        set({ includeConditioner: include });
        if (include && !get().conditionerConfig) {
          get().createMatchingConditioner();
        }
      },

      approve: () => set({ approved: true }),

      setSalonName: (name) => set({ salonName: name }),

      setStep: (step) => set({ step }),

      clearSession: () => set({ ...initialSessionState }),

      createMatchingConditioner: () => {
        const { shampooConfig, currentConfig } = get();
        const source = shampooConfig ?? currentConfig;
        if (!source) return;
        const copy = PRODUCT_COPY.conditioner;
        const conditioner: DesignConfig = applyDesignPatch(source, {
          productType: 'conditioner',
          productName: copy.productName,
          tagline: copy.tagline,
          volumeText: copy.volumeText,
        });
        set({ conditionerConfig: conditioner, includeConditioner: true });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        logoDataUrl: state.logoDataUrl,
        logoFileName: state.logoFileName,
        brandAnalysis: state.brandAnalysis,
        designs: state.designs,
        selectedDesignIndex: state.selectedDesignIndex,
        currentConfig: state.currentConfig,
        configHistory: state.configHistory,
        historyIndex: state.historyIndex,
        shampooConfig: state.shampooConfig,
        conditionerConfig: state.conditionerConfig,
        includeConditioner: state.includeConditioner,
        approved: state.approved,
        salonName: state.salonName,
        step: state.step,
      }),
    },
  ),
);

export type { SessionState, DesignSessionStep };
