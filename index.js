const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 4322; // Choose the desired port number

// Set up CORS with allowed origin
const allowedOrigins = [
  "https://chatshqip.netlify.app",
  "http://localhost:4321",
];
const corsOptions = {
  origin: (origin, callback) => {
    console.log({ origin });
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(
        new Error("Not allowed by CORS! Try adding your origin in backend!")
      );
    }
  },
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const admin = require("firebase-admin");

// Firebase Admin SDK
const serviceAccount = require("./firebase/realtime-chat-36fa1-firebase-adminsdk-fbsvc-8d49e9b245"); // Replace with the actual path to your service account credentials file
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

//ROUTESS
app.post("/send-notification", (req, res) => {
  try {
    // Send the notification
    admin
      .messaging()
      .sendEachForMulticast(req.body)
      .then((response) => {
        response.failureCount > 0
          ? res.status(500).send(response)
          : res.status(200).send("Notification sent successfully");
      })
      .catch((error) => {
        console.error("Error sending notification:", error);
        res.send(error);
      });
  } catch (error) {
    console.log({ sendNotificationError: error });
  }
});

//send firebase config
app.get("/get-firebase-config", async (req, res) => {
  try {
    res.status(200).json({});
  } catch (error) {
    console.error("Error getting firebase config:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

//get app badges
app.get("/firestore/appBadges/:documentId", async (req, res) => {
  const { documentId } = req.params;

  try {
    // Update the Firestore document with the new data
    const docRef = admin.firestore().collection("appBadges").doc(documentId);
    const increment = admin.firestore.FieldValue.increment(1);

    await docRef.set({ appBadge: increment }, { merge: true });

    // Retrieve the updated document data
    const updatedDocSnapshot = await docRef.get();
    const updatedDocData = updatedDocSnapshot.data();
    const { appBadge } = updatedDocData; //return value of app badge

    res
      .status(200)
      .json({ appBadge, message: "Document updated successfully" });
  } catch (error) {
    console.error("Error updating Firestore document:", error);
    res.status(500).json({ appBadgesError: "An error occurred" });
  }
});

app.post("/firebase-messaging-service-worker-error", (req, res) => {
  try {
    console.log({ firebaseMessagingServiceWorkerError: req.body });
  } catch (error) {
    console.log({ error });
  }
});

// Define routes
app.get("/", (req, res) => {
  console.log("Hello, world!");
  res.send("Hello, world!"); // Replace with your desired response
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
