window.addEventListener("load", async () => {

	const recent_bar = document.querySelector('.recent_bar')

	await fetch("/project")
		.then(res => res.json())
		.then(data => {
			if (data.ok) {
				recent_bar.innerHTML = ""

				data.ok.forEach(project => {
					recent_bar.innerHTML += `<a class="nav-link" href="/project/${project._id}">
													<div class="nav-link-icon"><i class="material-icons">image</i></div>
													<div class="card-body fw-bold">
														${project.project_name || "Recent Test Project"}
													</div>
												</a>`
				});
			}
		})
		.catch(err => console.log(err))
})