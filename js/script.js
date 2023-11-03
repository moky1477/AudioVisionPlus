// Replace 'YOUR_API_KEY' with your actual Google Cloud API key
const apiKey = "AIzaSyAWRDJi1HhZqotXFolrQwLE9amc2QGkHv8";

document.getElementById("openCameraButton").addEventListener("click", () => {
  const cameraModal = document.getElementById("cameraModal");
  const cameraView = document.getElementById("cameraView");
  const captureButton = document.getElementById("captureButton");
  const closeCameraButton = document.getElementById("closeCameraButton");
  const imagePreview = document.getElementById("imagePreview");
  const captionResult = document.getElementById("captionResult");
  const captionText = document.getElementById("captionText");
  const captionAudio = document.getElementById("captionAudio");
  const audioResult = document.getElementById("audioResult");
  const generateAudioButton = document.getElementById("generateAudioButton");

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then(function (stream) {
      cameraView.srcObject = stream;
      cameraView.play();
      cameraModal.style.display = "block";
      captureButton.style.display = "block";
      closeCameraButton.style.display = "block";
      imagePreview.style.display = "none";
      captionResult.style.display = "none";
      captionAudio.style.display = "none";
      audioResult.style.display = "none";
    })
    .catch(function (err) {
      console.error("Error accessing the camera: " + err);
    });
});

document.getElementById("closeCameraButton").addEventListener("click", () => {
  const cameraModal = document.getElementById("cameraModal");
  const cameraView = document.getElementById("cameraView");
  const captureButton = document.getElementById("captureButton");

  cameraView.srcObject.getTracks().forEach((track) => track.stop());
  cameraView.srcObject = null;
  cameraModal.style.display = "none";
  captureButton.style.display = "none";
});

document.getElementById("captureButton").addEventListener("click", () => {
  const cameraView = document.getElementById("cameraView");

  const canvas = document.createElement("canvas");
  canvas.width = cameraView.videoWidth;
  canvas.height = cameraView.videoHeight;
  canvas.getContext("2d").drawImage(cameraView, 0, 0);
  const imageSrc = canvas.toDataURL("image/png");

  // Display the captured image in the "imagePreview" div
  const imagePreview = document.getElementById("imagePreview");
  const capturedImage = document.getElementById("capturedImage");
  capturedImage.src = imageSrc;
  capturedImage.style.maxWidth = "100%";
  capturedImage.style.maxHeight = "300px";
  imagePreview.style.display = "block";

  // Close the camera
  const closeCameraButton = document.getElementById("closeCameraButton");
  closeCameraButton.click();

  // Call a function to send the captured image to the Google Cloud Vision API for caption generation
  generateCaptionsWithGoogleAPI(imageSrc);
});

document.getElementById("generateAudioButton").addEventListener("click", () => {
  const captionText = document.getElementById("captionText").textContent;
  const captionAudio = document.getElementById("captionAudio");

  // Use Web Speech API for text-to-speech synthesis
  const synthesis = new SpeechSynthesisUtterance(captionText);
  speechSynthesis.speak(synthesis);
  captionAudio.style.display = "block";
});

function generateCaptionsWithGoogleAPI(imageSrc) {
  $.ajax({
    type: "POST",
    url: `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    data: JSON.stringify({
      requests: [
        {
          image: {
            content: imageSrc.replace(/^data:image\/(png|jpg);base64,/, ""),
          },
          features: [{ type: "LABEL_DETECTION" }],
        },
      ],
    }),
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      const labelNames = extractLabelNames(data.responses[0].labelAnnotations);
      const caption = generateCaption(labelNames);
      const captionText = document.getElementById("captionText");
      captionText.textContent = caption;
      const captionResult = document.getElementById("captionResult");
      captionResult.style.display = "block";
    },
    error: function (error) {
      const captionResult = document.getElementById("captionResult");
      captionResult.textContent = "Error: Unable to perform image captioning.";
      captionResult.style.display = "block";
      console.error(error);
    },
  });
}

function extractLabelNames(labels) {
  return labels.map((label) => label.description);
}

function generateCaption(labelNames) {
  if (labelNames.length === 0) {
    return "Image contains no recognizable objects or labels.";
  } else {
    const sentence = `The image depicts ${formatLabels(labelNames)}.`;
    return sentence;
  }
}

function formatLabels(labelNames) {
  if (labelNames.length === 1) {
    return `a ${labelNames[0]}`;
  } else if (labelNames.length === 2) {
    return `${labelNames[0]} and ${labelNames[1]}`;
  } else {
    const lastLabel = labelNames.pop();
    return `${labelNames.join(", ")}, and ${lastLabel}`;
  }
}

// Function to translate text using Google Translate API
function translateToHindi(text) {
  const apiKey = "AIzaSyAWRDJi1HhZqotXFolrQwLE9amc2QGkHv8"; // Replace with your Google API key
  const endpoint = "https://translation.googleapis.com/language/translate/v2";

  const data = {
    q: text,
    target: "hi", // Language code for Hindi
    key: apiKey,
  };

  $.ajax({
    url: endpoint,
    method: "POST",
    data: data,
  })
    .done(function (response) {
      if (response && response.data && response.data.translations) {
        const hindiTranslation = response.data.translations[0].translatedText;
        document.getElementById("translatedCaption").style.display = "block";
        document.getElementById("hindiCaption").textContent = hindiTranslation;
      } else {
        console.error("Translation request failed.");
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error("Translation request failed:", errorThrown);
    });
}

// Function to generate captions with Google Cloud Vision API
function generateCaptionsWithGoogleAPI(imageSrc) {
  $.ajax({
    type: "POST",
    url: `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    data: JSON.stringify({
      requests: [
        {
          image: {
            content: imageSrc.replace(/^data:image\/(png|jpg);base64,/, ""),
          },
          features: [{ type: "LABEL_DETECTION" }],
        },
      ],
    }),
    contentType: "application/json; charset=utf-8",
    success: function (data) {
      const labelNames = extractLabelNames(data.responses[0].labelAnnotations);
      const caption = generateCaption(labelNames);
      const captionText = document.getElementById("captionText");
      captionText.textContent = caption;
      translateToHindi(caption); // Automatically translate the generated caption
      const captionResult = document.getElementById("captionResult");
      captionResult.style.display = "block";
    },
    error: function (error) {
      const captionResult = document.getElementById("captionResult");
      captionResult.textContent = "Error: Unable to perform image captioning.";
      captionResult.style.display = "block";
      console.error(error);
    },
  });
}

// Rest of your code...

function generateHindiAudio(text, audioElement) {
  const googleTTS = new googleTTS();
  googleTTS.TTS({
    text: text,
    lang: "hi", // Language code for Hindi
    event: "end",
    success: function (data) {
      audioElement.src = data;
      audioElement.play();
    },
  });
}

ResponsiveVoice.init({ key: "F2XdFjrE" });

document
  .getElementById("generateHindiAudioButton")
  .addEventListener("click", () => {
    const hindiCaption = document.getElementById("hindiCaption").textContent;
    const captionAudio = document.getElementById("captionAudio");
    generateAudio(hindiCaption, captionAudio);
    captionAudio.style.display = "block";
  });

const placeholderHindiCaption = "यह एक उदाहरण शीर्षक है"; // Replace with your generated Hindi caption
generateAudio(placeholderHindiCaption, document.getElementById("captionAudio"));
