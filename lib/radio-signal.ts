export const RADIO_STATE_EVENT = "field-radio:state";
export const RADIO_STATE_REQUEST_EVENT = "field-radio:status-request";
export const RADIO_TIME_EVENT = "field-radio:time";
export const RADIO_AUDIO_EVENT = "field-radio:audio-analysis";
export const RADIO_AUDIO_REQUEST_EVENT = "field-radio:audio-analysis-request";
let audioAnalysisRequested = false;

export function setRadioAudioAnalysisRequested(requested: boolean) {
  audioAnalysisRequested = requested;
  if (typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent<boolean>(RADIO_AUDIO_REQUEST_EVENT, { detail: requested }));
}

export function isRadioAudioAnalysisRequested() {
  return audioAnalysisRequested;
}

export type RadioSignal = {
  playing: boolean;
  index: number;
  title: string;
  artist: string;
  cover?: string;
};

export type RadioTimeSignal = {
  index: number;
  current: number;
};

export type RadioAudioSignal = {
  bars: number[];
  bass: number;
};
