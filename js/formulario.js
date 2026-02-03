// Validación de formulario de contacto
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("contactForm");
    const requiredFields = form.querySelectorAll(".required-field");

    // VALIDACIÓN EN TIEMPO REAL
    requiredFields.forEach(field => {
        const input = field.querySelector("input");

        input.addEventListener("input", () => {
            if (input.value.trim() === "") {
                field.classList.add("error");
                field.classList.remove("success");
            } else {
                field.classList.add("success");
                field.classList.remove("error");
            }
        });
    });

    // VALIDACIÓN AL ENVIAR
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        let formIsValid = true;

        requiredFields.forEach(field => {
            const input = field.querySelector("input");

            if (input.value.trim() === "") {
                field.classList.add("error");
                field.classList.remove("success");
                formIsValid = false;
            }
        });

        if (formIsValid) {
            alert("✅ El formulario se ha enviado correctamente.");

            form.reset();
            requiredFields.forEach(field => {
                field.classList.remove("success", "error");
            });
        } else {
            alert("⚠️ Debes rellenar todas las casillas obligatorias.");
        }
    });

});