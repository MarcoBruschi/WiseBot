const topicInput = document.getElementById("topic-input");
const apiInput = document.getElementById("api-input");
const submitBtn = document.getElementById("submit-btn");
const loadingModal = document.getElementById("loading-modal");
const errorModal = document.getElementById("error-modal");

function showLoadingModal(element) {
  element.classList.add("active");
}

function hideLoadingModal(element) {
  element.classList.remove("active");
}

async function generateTopic() {
  if (!topicInput.value.trim()) return;

  showLoadingModal(loadingModal);
  try {
    const topicBody = {
      topic: topicInput.value,
      apiKey: apiInput.value
    }
    const response = await fetch("http://localhost:3000/generate", {
      method: "POST",
      body: JSON.stringify(topicBody),
      headers: {
        "Content-Type": "application/json"
      }
    });

    const data = await response.json();
    if (data.error) {
      hideLoadingModal(loadingModal);
      showLoadingModal(errorModal);
      document.querySelector(".error-message").textContent = data.error;
      setInterval(() => hideLoadingModal(errorModal), 2500);
      return;
    }
    await displayCards();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    hideLoadingModal(loadingModal);
  }
}

async function displayCards() {
  const response = await fetch("http://localhost:3000/topics");
  const topics = await response.json();
  if (topics.error) return;
  const cardsDiv = document.querySelector(".main-cards-section");
  cardsDiv.innerHTML = "";
  topics.data.forEach(t => {
    const cardContainer = document.createElement("div");
    cardContainer.classList += "cards-section-card";
    cardContainer.setAttribute("id", t._id);
    const cardTitle = document.createElement("div");
    cardTitle.classList += "card-title";
    cardTitle.textContent = t.title;
    const cardDescription = document.createElement("div");
    cardDescription.classList += "card-description";
    cardDescription.textContent = t.detailed_analysis.substring(0, 200)+"...";
    const cardLinks = document.createElement("div");
    cardLinks.classList += "card-links";
    t.links.forEach((l, index) => {
      const cardLink = document.createElement("a");
      cardLink.innerHTML = `Link ${index + 1}`;
      cardLink.href = l;
      cardLinks.append(cardLink);
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.classList += "card-links-delete-btn";
    deleteBtn.textContent = "X";
    cardLinks.append(deleteBtn);
    cardContainer.append(cardTitle);
    cardContainer.append(cardDescription);
    cardContainer.append(cardLinks);
    cardsDiv.append(cardContainer);
  });
}

async function deleteCard(e) {
  if (e.type !== "click") return
  const deleteBtn = e.target.closest(".card-links-delete-btn");
  if (!deleteBtn) return;
  const card = deleteBtn.closest(".cards-section-card");
  const response = await fetch("http://localhost:3000/topics/" + card.id, {
    method: "DELETE"
  });
  const data = await response.json();
  if (!data.success) return;
  await displayCards();
}

document.addEventListener("click", deleteCard);
submitBtn.addEventListener("click", generateTopic);
document.addEventListener("DOMContentLoaded", displayCards);