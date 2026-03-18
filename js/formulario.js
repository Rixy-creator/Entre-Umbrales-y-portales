document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const btn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const requiredFields = form.querySelectorAll(".required-field");

    // 1. TU VALIDACIÓN EN TIEMPO REAL (Mantiene tus estilos success/error)
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
        input.addEventListener("blur", validateField);
    });

    // 2. LÓGICA DE ENVÍO
    form.addEventListener("submit", function(e) {
        e.preventDefault(); // Evitamos que la página se recargue
        
        let formIsValid = true;

        // Comprobamos campos obligatorios antes de enviar
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
            return;
        }

        // --- 3. INICIO DEL ENVÍO (Efecto Visual) ---
        btn.disabled = true;
        spinner.classList.remove("d-none"); // Mostramos el spinner rojo
        btnText.innerText = "Abriendo portal..."; // Mensaje temático

        // --- 4. PETICIÓN AJAX A FORMSPREE ---
        $.ajax({
            url: form.action, // Usa el ID de Formspree de tu HTML
            method: 'POST',
            data: $(form).serialize(),
            dataType: 'json',
            success: function() {
                alert("✅ El mensaje ha cruzado el portal con éxito.");
                form.reset(); // Limpia los campos
                restaurarBoton();
            },
            error: function() {
                alert("❌ El portal se ha cerrado. Reintenta el envío.");
                restaurarBoton();
            }
        });

        // Función para devolver el botón a su estado normal
        function restaurarBoton() {
            btn.disabled = false;
            spinner.classList.add("d-none");
            btnText.innerText = "Enviar mensaje";
            // Quitamos los bordes de éxito/error de los campos
            requiredFields.forEach(f => f.classList.remove("success", "error"));
        }
    });
});