const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
const fs = require('fs');
const gcconfig = {
    projectId: "awesome-places-1555851310405",
    keyFilename: "awesome-places.json"
};
const gcs = require('@google-cloud/storage')(gcconfig);
const UUID = require("uuid-v4");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.storeImage = functions.https.onRequest((request, response) => {
    return cors(request, response, () => {
      const body = JSON.parse(request.body);
      fs.writeFileSync("/tmp/uploaded-image.jpg", body.image, "base64", err => {
        console.log(err);
        return response.status(500).json({ error: err });
      });
      const bucket = gcs.bucket("awesome-places-1555851310405.appspot.com");
      const uuid = UUID();
   
      return bucket.upload(
        "/tmp/uploaded-image.jpg",
        {
          uploadType: "media",
          destination: "/places/" + uuid + ".jpg",
          metadata: {
            metadata: {
              contentType: "image/jpeg",
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        (err, file) => {
          if (!err) {
            return response.status(201).json({
              imageUrl:
                "https://firebasestorage.googleapis.com/v0/b/" +
                bucket.name +
                "/o/" +
                encodeURIComponent(file.name) +
                "?alt=media&token=" +
                uuid
            });
          } else {
            console.log(err);
            return response.status(500).json({ error: err });
          }
        }
      );
    });
  });
