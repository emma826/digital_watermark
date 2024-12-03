const verify_image = document.getElementById("verify_image")
const image_container = document.getElementById("image_container")
const verify_btn = document.getElementById("verify_btn")
const success = document.getElementById("success")
const error = document.getElementById("error")

verify_image.addEventListener("change", async (e) => {
    const file = e.target.files[0]

    if (file) {
        const reader = new FileReader()

        reader.onload = (e) => {
            image_container.innerHTML = `<img src="${e.target.result}" class="image-fluid rounded w-100"/>`
        }

        reader.readAsDataURL(file)
    }
    else {
        image_container.innerHTML = `<i class="material-icons" style="font-size: 60px;">upload</i><h6>Upload Image</h6>`
    }
})

verify_btn.addEventListener("click", async () => {
    const public_key = document.getElementById("public_key").value.trim()
    const signature = document.getElementById("signature").value.trim()
    const image = verify_image.files[0]

    if (!image) {
        error.style.display = "block"
        success.style.display = "none"

        error.innerHTML = "please upload a file to continue"

        setTimeout(() => {
            error.style.display = "none"
        }, 3000);
        return
    }

    const formData = new FormData()
    formData.append('image', image);
    formData.append("public_key", public_key)
    formData.append("signature", signature)

    const params = {
        body: formData,
        method: "POST"
    }

    await fetch("/project/verify_signature", params)
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                success.style.display = "block"
                error.style.display = "none"

                success.innerHTML = data.success

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
        .catch(err => console.log(err))
})