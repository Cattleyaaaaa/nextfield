export const RADIO_STATE_EVENT = "field-radio:state";
export const RADIO_STATE_REQUEST_EVENT = "field-radio:status-request";
export const RADIO_TIME_EVENT = "field-radio:time";

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
