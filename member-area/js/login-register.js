// ==== Register Form ====
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("register-password").value;

    const allValid = [...document.querySelectorAll("#password-rules li")].every(item =>
      item.classList.contains("valid")
    );

    if (!name || !email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    if (!allValid) {
      alert("Please ensure your password meets all the requirements.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
        // 🚫 No emailRedirectTo = no confirmation, just auto-register
      }
    });

    if (error) {
      alert("Registration failed: " + error.message);
      return;
    }

    // ✅ Go straight to login page
    window.location.href = "login.html";
  });
}
