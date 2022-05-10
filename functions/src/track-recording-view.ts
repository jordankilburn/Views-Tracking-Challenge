import { db } from "./index";
import * as admin from "firebase-admin";
import { Recording } from "./types";

/* BONUS OPPORTUNITY
It's not great (it's bad) to throw all of this code in one file.
Can you help us organize this code better? ✔️
*/

export async function trackRecordingView(
  viewerId: string,
  recordingId: string
): Promise<void> {
  //create a ref to the (potential) matching UniqueViews doc
  const uniqueViewsRef = db
    .collection("UniqueViews")
    .where("viewerId", "==", viewerId)
    .where("recordingId", "==", recordingId);

  //use a transaction here to make sure no double view counting even if two requests are made at the same time.
  await db
    .runTransaction(async (t): Promise<void> => {
      /** Query UniqueViews collection and see if an entry for this user & recording exists **/
      const uniqueViewsSnapshot = await t.get(uniqueViewsRef);

      if (!uniqueViewsSnapshot.empty) return; //If it already exists, do nothing.

      //Update the Recording and the User who created the recording
      const recordingDocRef = db.collection("Recordings").doc(recordingId);

      //Update the uniqueRecordingViewCount on the User. We will need to get the creatorId first.
      const recordingDoc = await recordingDocRef.get();
      if (!recordingDoc.exists) return;
      const { creatorId } = recordingDoc.data() as Recording;
      const creatorUserRef = db.collection("Users").doc(creatorId);

      //update both docs
      t.update(creatorUserRef, {
        uniqueRecordingViewCount: admin.firestore.FieldValue.increment(1),
      });
      t.update(recordingDocRef, {
        uniqueViewCount: admin.firestore.FieldValue.increment(1),
      });

      //Add a doc to UniqueViews to ensure this view is only counted once.
      t.set(db.collection("UniqueViews").doc(), { viewerId, recordingId });
    })
    .catch((err) => console.log("Error:", err));
}
