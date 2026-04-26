const input = document.getElementById("username");
const error = document.getElementById("usernameError");

input.addEventListener("input", () => {
    if (input.value.trim() === "") {
        error.classList.remove("hidden");
        input.classList.add("border-red-500");
    } else {
        error.classList.add("hidden");
        input.classList.remove("border-red-500");
    }
});