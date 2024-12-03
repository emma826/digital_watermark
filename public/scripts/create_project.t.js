const create_project = document.getElementById("name")
const error = document.getElementById("error")
const success = document.getElementById("success")

create_project.addEventListener("click", async () => {
	const project_name = document.getElementById("project_name").value
	const project_id = document.getElementById("project_id").value

	var params = {
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ project_name, project_id }),
		method: "POST"
	}

	await fetch("/project/name_project", params)
		.then(res => res.json())
		.then(data => {
			if (data.success) {
				error.style.display = "none"
				success.style.display = "block"

				success.innerHTML = "Project Name created, redirecting ..."

				window.location = `/project/edit_project/${data.id}`
				

				setTimeout(() => {
					success.style.display = "none"
				}, 3000);
			}
			else {
				error.style.display = "block"
				success.style.display = "none"

				error.innerHTML = data.error

				setTimeout(() => {
					error.style.display = "none"
				}, 3000);
			}
		})
		.catch(err => console.log(err))
})