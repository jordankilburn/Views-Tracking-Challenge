export interface Recording {
  id: string; // matches document id in firestore
  creatorId: string; // id of the user that created this recording
  uniqueViewCount: number;
}

export interface User {
  id: string; // mathes both the user's document id
  uniqueRecordingViewCount: number; // sum of all recording views
}

export interface UniqueViews {
  /* UniqueViews is a collection of all *unique* views for all recordings
     This way, the individual doc size will not be too large */
  viewerId: string; // viewer id
  recordingId: string; //recording id
}

export enum Collections {
  Users = "Users",
  Recordings = "Recordings",
  UniqueViews = "UniqueViews",
}
