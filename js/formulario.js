document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const btn = document.getElementById("submitBtn");
    const status = document.getElementById("form-status"); // Asegúrate de tener este ID en el HTML
    const requiredFields = form.querySelectorAll(".required-field");

    // 1. VALIDACIÓN EN TIEMPO REAL (Mantiene tus estilos success/error)
    requiredFields.forEach(field => {
        const input = field.querySelector("input, textarea");
        const validateField = () => {
            if (input.value.trim() === "") {
                field.classList.remove("success", "error");
            } else {
                field.classList.add("success");
                field.classList.remove("error");
            }
        };
        input.addEventListener("input", validateField);
    });

    // 2. PROCESO DE ENVÍO
    form.addEventListener("submit", function(e) {
        e.preventDefault(); // Detenemos el envío automático de HTML
        
        let formIsValid = true;

        // Comprobamos si falta algún campo obligatorio
        requiredFields.forEach(field => {
            const input = field.querySelector("input, textarea");
            if (input.value.trim() === "") {
                field.classList.add("error");
                field.classList.remove("success");
                formIsValid = false;
            }
        });

        if (!formIsValid) {
            alert("⚠️ Debes rellenar todas las casillas obligatorias.");
            return; // Si hay errores, no se ejecuta el envío a Formspree
        }

        // 3. SI TODO ESTÁ OK -> ENVÍO POR AJAX (Formspree)
        btn.disabled = true;
        btn.innerText = "Enviando...";

        $.ajax({
            url: form.action, // Usa el https://formspree.io que ya tienes en el HTML
            method: 'POST',
            data: $(form).serialize(), // Empaqueta los datos para enviarlos
            dataType: 'json',
            success: function() {
                // Éxito total
                alert("✅ ¡Mensaje enviado con éxito!");
                form.reset(); // Limpia los campos
                requiredFields.forEach(f => f.classList.remove("success", "error"));
                btn.disabled = false;
                btn.innerText = "Enviar mensaje";
            },
            error: function() {
                // Error de red o configuración
                alert("❌ Hubo un problema al enviar el formulario. Inténtalo de nuevo.");
                btn.disabled = false;
                btn.innerText = "Enviar mensaje";
            }
        });
    });
});