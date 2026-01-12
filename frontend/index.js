const topicInput = document.getElementById("topic-input");
const apiInput = document.getElementById("api-input");
const submitBtn = document.getElementById("submit-btn");
const loadingModal = document.getElementById("loading-modal");
const errorModal = document.getElementById("error-modal");
const cardModal = document.getElementById("card-modal");

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
    cardDescription.textContent = t.detailed_analysis.substring(0, 200) + "...";
    
    const cardLinksContainer = document.createElement("div");
    cardLinksContainer.classList += "card-footer";
    
    const cardLinks = document.createElement("div");
    cardLinks.classList += "card-links";
    t.links.forEach((l, index) => {
      const cardLink = document.createElement("a");
      cardLink.innerHTML = `Link ${index + 1}`;
      cardLink.href = l;
      cardLinks.append(cardLink);
    });
    
    const cardButtons = document.createElement("div");
    cardButtons.classList += "card-buttons";
    const viewBtn = document.createElement("button");
    viewBtn.classList += "card-links-view-btn";
    viewBtn.textContent = "Ver Mais";
    cardButtons.append(viewBtn);
    const deleteBtn = document.createElement("button");
    deleteBtn.classList += "card-links-delete-btn";
    deleteBtn.textContent = "X";
    cardButtons.append(deleteBtn);
    
    cardLinksContainer.append(cardLinks);
    cardLinksContainer.append(cardButtons);
    cardContainer.append(cardTitle);
    cardContainer.append(cardDescription);
    cardContainer.append(cardLinksContainer);
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

async function viewCardModal(e) {
  if (e.type !== "click") return;
  const viewBtn = e.target.closest(".card-links-view-btn");
  if (!viewBtn) return;
  const card = viewBtn.closest(".cards-section-card");
  const cardId = card.id;
  
  try {
    const response = await fetch("http://localhost:3000/topics/" + cardId);
    const data = await response.json();
    
    if (data.error) {
      showLoadingModal(errorModal);
      document.querySelector(".error-message").textContent = data.error;
      setInterval(() => hideLoadingModal(errorModal), 2500);
      return;
    }
    
    const cardData = data.data;
    const modalContent = document.querySelector(".modal-content-card");
    modalContent.innerHTML = `
      <h2 style="font-size: 2rem; color: var(--white); margin-bottom: 1rem;">${cardData.title}</h2>
      <div style="color: var(--light-grey); font-size: 1rem; line-height: 1.6; margin-bottom: 1.5rem;">${cardData.detailed_analysis}</div>
      <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
        ${cardData.links.map((link, index) => `<a href="${link}" target="_blank" style="text-decoration: none; font-weight: 500; padding: 0.625rem 1.25rem; background-color: var(--darker-grey); border: 1px solid var(--grey); color: var(--accent); border-radius: 10px; font-size: 0.875rem; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.backgroundColor='var(--grey)'; this.style.borderColor='var(--light-grey)'; this.style.color='var(--white)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(224, 224, 224, 0.1)';" onmouseout="this.style.backgroundColor='var(--darker-grey)'; this.style.borderColor='var(--grey)'; this.style.color='var(--accent)'; this.style.transform='translateY(0)'; this.style.boxShadow='none';">Link ${index + 1}</a>`).join('')}
      </div>
      <button id="close-modal-btn" style="margin-top: 1.5rem; padding: 0.625rem 1.5rem; background-color: var(--grey); border: 1px solid var(--light-grey); color: var(--white); border-radius: 8px; cursor: pointer; font-size: 1rem; transition: all 0.3s ease;" onmouseover="this.style.backgroundColor='var(--light-grey)';" onmouseout="this.style.backgroundColor='var(--grey)';">Fechar</button>
    `;
    
    document.getElementById("close-modal-btn").addEventListener("click", () => {
      hideLoadingModal(cardModal);
    });
    
    showLoadingModal(cardModal);
  } catch (error) {
    console.error("Error:", error);
    showLoadingModal(errorModal);
    document.querySelector(".error-message").textContent = "Erro ao carregar os detalhes do card";
    setInterval(() => hideLoadingModal(errorModal), 2500);
  }
}

document.addEventListener("click", deleteCard);
document.addEventListener("click", viewCardModal);
submitBtn.addEventListener("click", generateTopic);
document.addEventListener("DOMContentLoaded", displayCards);

// Close modal when clicking outside the content
cardModal.addEventListener("click", (e) => {
  if (e.target === cardModal) {
    hideLoadingModal(cardModal);
  }
});