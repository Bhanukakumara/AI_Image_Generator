// Theme Toggle
const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");

const modelSelect = document.querySelector("#model-select");
const countSelect = document.querySelector("#count-select");
const ratioSelect = document.querySelector("#ratio-select");

const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "";

const toggleTheme = () => {
  const isDarkTheme = document.body.classList.toggle("dark-theme");
  themeToggle.querySelector("i").className = isDarkTheme
    ? "fa-solid fa-sun"
    : "fa-solid fa-moon";
};

themeToggle.addEventListener("click", toggleTheme);

const getImageDimensions = (selectedRatio, baseSize = 512) => {
  const [w, h] = selectedRatio.split("/").map(Number);
  const width = baseSize * w;
  const height = baseSize * h;
  return { width, height };
};

const generateImages = async (model, count, ratio, prompt) => {
  const { width, height } = getImageDimensions(ratio);

  gridGallery.innerHTML = "<p>Generating images...</p>";

  const promises = Array.from({ length: count }, async () => {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            inputs: prompt,
            options: { wait_for_model: true },
          }),
        }
      );

      if (!response.ok) throw new Error("Model error or rate limited");

      const blob = await response.blob();
      const imageURL = URL.createObjectURL(blob);

      return imageURL;
    } catch (err) {
      console.error(err);
      return null;
    }
  });

  const imageURLs = await Promise.all(promises);

  gridGallery.innerHTML = "";
  imageURLs.forEach((url, i) => {
    if (url) {
      gridGallery.innerHTML += `
        <div class="img-card" style="aspect-ratio:${ratio}">
          <img src="${url}" alt="Generated Image ${i + 1}">
          <div class="img-overlay">
            <a href="${url}" download="ai-image-${
        i + 1
      }.png" class="img-download-btn">
              <i class="fa-solid fa-download"></i>
            </a>
          </div>
        </div>`;
    }
  });
};

promptForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const model = modelSelect.value;
  const count = parseInt(countSelect.value) || 1;
  const ratio = ratioSelect.value || "1/1";
  const prompt = promptInput.value.trim();

  if (!model || !prompt) {
    alert("Please provide both prompt and model.");
    return;
  }

  generateImages(model, count, ratio, prompt);
});

promptBtn.addEventListener("click", () => {
  const prompt =
    examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
  promptInput.value = prompt;
  promptInput.focus();
});
