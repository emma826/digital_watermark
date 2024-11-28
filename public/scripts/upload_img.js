const project_image = document.getElementById("project_img")
const recent_project = document.getElementById("recent_project")

project_image.addEventListener("change", async (e) => {
	const file = e.target.files[0]

	if (!file) {
		return;
	}

	const formData = new FormData();
	formData.append('uploadedFile', file);

	try {
		const response = await fetch('/project/upload_img', {
			method: 'POST',
			body: formData,
		});

		const data = await response.json();

		if (data.ok) {
			window.location = `/project/${data.ok}`
			await fetch_recent_project()
		}

		if (!response.ok) {
			throw new Error(data.error || 'Upload failed');
		}

	} catch (error) {
	}
})

const fetch_recent_project = async () => {
	await fetch("/project")
		.then(res => res.json())
		.then(data => {
			if (data.ok) {
				recent_project.innerHTML = ""

				data.ok.forEach(project => {
					recent_project.innerHTML += `<div class="col-lg-4">
													<a href="/project/${project._id}" class="d-block w-100 text-dark" style="text-decoration: none">
														<div class="card">
															<img src="/uploads/original_file/${project.file_name}" alt="">
															<div class="card-body fw-bold">
																${project.project_name || "Recent Test Project"}
															</div>
														</div>
													</a>
												</div>`
				});
			}
		})
		.catch(err => console.log(err))
}

window.addEventListener("load", fetch_recent_project)