const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');

fileInput.addEventListener('change', function() {
    let file = fileInput.files[0]
    if (file) {
        let reader = new FileReader();
        reader.onload = function(e) {
            canvas.innerHTML = "";

            let img = document.createElement("img");
            img.src = e.target.result;

            canvas.appendChild(img);
        };

        reader.readAsDataURL(file);
    }
})