const signup = document.querySelector(".sign_up")
const success = document.querySelector(".success")
const error = document.querySelector(".error")

signup.addEventListener("click", async () => {
	const name = document.querySelector("#name").value
	const email = document.querySelector("#email").value
	const password = document.querySelector("#password").value

	var params = {
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ name, email, password }),
		method: "POST"
	}

	await fetch("/auth/register", params)
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				error.style.display = "none"
				success.style.display = "block"
				success.innerHTML = "Signup successful, redirecting ..."

				window.location = "/"

				setTimeout(() => {
					success.style.display = "none"
				}, 3000);
			}
			else {
				error.style.display = "block"
				success.style.display = "none"
				error.innerHTML = data.errors

				setTimeout(() => {
					error.style.display = "none"
				}, 3000);
			}
		})
		.catch(err => console.log)
})
