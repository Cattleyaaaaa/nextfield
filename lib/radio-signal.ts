export const RADIO_STATE_EVENT = "field-radio:state";
export const RADIO_STATE_REQUEST_EVENT = "field-radio:status-request";
export const RADIO_TIME_EVENT = "field-radio:time";
export const RADIO_AUDIO_EVENT = "field-radio:audio-analysis";
export const RADIO_COMMAND_EVENT = "field-radio:command";
export const RADIO_VISUALIZER_BAR_HEIGHTS = [
  28, 58, 39, 77, 48, 91, 62, 42, 84, 52, 95, 69, 35, 73, 51, 88, 44, 64, 31,
  72, 48, 81, 37, 60,
] as const;
export const RADIO_VISUALIZER_BAR_COUNT = RADIO_VISUALIZER_BAR_HEIGHTS.length;
/** Pure-mode rain controls: drops per second, ripple travel in screen pixels per second, and fall progress per second. */
export const RADIO_PURE_MODE_EFFECTS = {
  rainFrequency: 0.9,
  rippleSpeed: 250,
  dropFallSpeed: 0.62,
};
export type RadioPlaybackMode = "single" | "list" | "random";
export type RadioSignal = {
  playing: boolean;
  index: number;
  title: string;
  artist: string;
  cover?: string;
  volume: number;
  playbackMode: RadioPlaybackMode;
};

export type RadioTimeSignal = {
  index: number;
  current: number;
  duration: number;
};

export type RadioCommand =
  | { action: "toggle" | "previous" | "next" }
  | { action: "seek"; time: number }
  | { action: "set-volume"; volume: number }
  | { action: "set-playback-mode"; mode: RadioPlaybackMode };

export type RadioAudioSignal = {
  bars: number[];
  bass: number;
};
