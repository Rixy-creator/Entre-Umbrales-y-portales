document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const btn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const requiredFields = form.querySelectorAll(".required-field");

    // ── UTILIDAD: Sanitización básica contra XSS ──────────────────────────────
    function sanitizeInput(str) {
        const div = document.createElement("div");
        div.appendChild(document.createTextNode(str.trim()));
        return div.innerHTML;
    }

    // ── UTILIDAD: Validación de formato de email ──────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ── 1. VALIDACIÓN EN TIEMPO REAL ──────────────────────────────────────────
    requiredFields.forEach(field => {
        const input = field.querySelector("input, textarea");

        const validateField = () => {
            const value = input.value.trim();

            if (value === "") {
                field.classList.remove("success", "error");
                return;
            }

            // Validación extra para el campo email
            if (input.type === "email") {
                if (emailRegex.test(value)) {
                    field.classList.add("success");
                    field.classList.remove("error");
                } else {
                    field.classList.add("error");
                    field.classList.remove("success");
                }
                return;
            }

            field.classList.add("success");
            field.classList.remove("error");
        };

        input.addEventListener("input", validateField);
        input.addEventListener("blur", validateField);
    });

    // ── 2. LÓGICA DE ENVÍO ────────────────────────────────────────────────────
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        let formIsValid = true;

        // Validación de campos obligatorios vacíos
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

        // Validación de formato de email
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailRegex.test(emailInput.value.trim())) {
            alert("⚠️ El formato del correo electrónico no es válido.");
            return;
        }

        // Longitud máxima de los campos (evita payloads enormes)
        const nombre   = sanitizeInput(form.querySelector('[name="nombre"]').value);
        const apellidos = sanitizeInput(form.querySelector('[name="apellidos"]').value);
        const email    = sanitizeInput(emailInput.value);
        const mensaje  = sanitizeInput(form.querySelector('[name="mensaje"]').value);

        if (nombre.length > 100 || apellidos.length > 100) {
            alert("⚠️ El nombre o los apellidos son demasiado largos (máx. 100 caracteres).");
            return;
        }
        if (mensaje.length > 2000) {
            alert("⚠️ El comentario es demasiado largo (máx. 2000 caracteres).");
            return;
        }

        // ── 3. INICIO DEL ENVÍO (Efecto Visual) ──────────────────────────────
        btn.disabled = true;
        spinner.classList.remove("d-none");
        btnText.innerText = "Abriendo portal...";

        // ── 4. PETICIÓN AJAX A FORMSPREE ──────────────────────────────────────
        $.ajax({
            url: form.action,
            method: "POST",
            // Enviamos los datos sanitizados manualmente en lugar de serialize()
            data: {
                nombre:    nombre,
                apellidos: apellidos,
                email:     email,
                mensaje:   mensaje,
                // Honeypot: Formspree descarta el envío si este campo viene relleno
                _gotcha:   form.querySelector('[name="_gotcha"]').value
            },
            dataType: "json",
            success: function () {
                alert("✅ El mensaje ha cruzado el portal con éxito.");
                form.reset();
                restaurarBoton();
            },
            error: function () {
                alert("❌ El portal se ha cerrado. Reintenta el envío.");
                restaurarBoton();
            }
        });

        // Devuelve el botón a su estado original
        function restaurarBoton() {
            btn.disabled = false;
            spinner.classList.add("d-none");
            btnText.innerText = "Enviar mensaje";
            requiredFields.forEach(f => f.classList.remove("success", "error"));
        }
    });
});