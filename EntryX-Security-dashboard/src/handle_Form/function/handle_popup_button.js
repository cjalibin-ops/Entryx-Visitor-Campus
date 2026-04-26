
const modal = document.getElementById("registerModal");
const openBtn = document.getElementById("openRegister");
const closeBtn = document.querySelector(".close");

openBtn.onclick = () => {
  modal.style.display = "block";
  document.getElementById("rfidcards").focus();
};

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
};

