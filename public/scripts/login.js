const login = document.querySelector(".login")
const success = document.querySelector(".success")
const error = document.querySelector(".error")

const currentUrl = window.location.href;

login.addEventListener("click", async () => {
	// console.log("emma")
	const email = document.querySelector("#email").value
	const password = document.querySelector("#password").value

	var params = {
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ email, password }),
		method: "POST"
	}

	await fetch("/auth/login", params)
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				error.style.display = "none"
				success.style.display = "block"
				success.innerHTML = "Login successful, redirecting ..."

				window.location = "/"
				
			}
			else {
				error.style.display = "block"
				success.style.display = "none"
				error.innerHTML = data.errors
			}
		})
		.catch(err => console.log(err))
})