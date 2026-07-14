document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const btn = document.getElementById("submitBtn");
    const btnText = document.getElementById("btnText");
    const spinner = document.getElementById("spinner");
    const requiredFields = form.querySelectorAll(".required-field");

    // ── REFERENCIAS AL MODAL ──────────────────────────────────────────────────
    const modal = document.getElementById("formModal");
    const modalIcon = document.getElementById("modalIcon");
    const modalTitle = document.getElementById("modalTitle");
    const modalMsg = document.getElementById("modalMessage");
    const modalBtn = document.getElementById("modalCloseBtn");
    const backdrop = modal.querySelector(".form-modal__backdrop");

    // ── UTILIDAD: Abrir modal ─────────────────────────────────────────────────
    /**
     * @param {"success"|"error"} type
     * @param {string} title   Texto del título
     * @param {string} message Texto del mensaje
     */
    function openModal(type, title, message) {
        // Limpiar estados previos
        modal.classList.remove("is-visible", "is-success", "is-error");
        modalIcon.classList.remove("icon--success", "icon--error");

        // Aplicar estado
        modal.classList.add(type === "success" ? "is-success" : "is-error");
        modalIcon.classList.add(type === "success" ? "icon--success" : "icon--error");

        // Rellenar contenido
        modalTitle.textContent = title;
        modalMsg.textContent = message;

        // Mostrar (quitar hidden antes de activar la transición)
        modal.hidden = false;
        // Pequeño retraso para que el navegador pinte el estado inicial
        // y la transición CSS funcione correctamente
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                modal.classList.add("is-visible");
                modalBtn.focus();
            });
        });

        // Bloquear scroll del body
        document.body.style.overflow = "hidden";
    }

    // ── UTILIDAD: Cerrar modal ────────────────────────────────────────────────
    function closeModal() {
        modal.classList.remove("is-visible");

        // Esperar a que termine la transición antes de ocultar con hidden
        modal.addEventListener("transitionend", function handler() {
            modal.hidden = true;
            modal.removeEventListener("transitionend", handler);
        });

        // Restaurar scroll del body
        document.body.style.overflow = "";
    }

    // ── CIERRE: botón, fondo y tecla Escape ──────────────────────────────────
    modalBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !modal.hidden) {
            closeModal();
        }
    });

    // ── UTILIDAD: Sanitización básica contra XSS ──────────────────────────────────
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

    // ── 2. CONTADOR DE CARACTERES (textarea) ─────────────────────────────────
    const textarea = form.querySelector('[name="mensaje"]');
    const charCounter = document.getElementById("charCounter");
    const MAX_CHARS = 2000;

    if (textarea && charCounter) {
        textarea.addEventListener("input", () => {
            const len = textarea.value.length;
            charCounter.textContent = `${len} / ${MAX_CHARS}`;
            charCounter.classList.remove("warn", "danger");
            if (len > 1900) {
                charCounter.classList.add("danger");
            } else if (len > 1500) {
                charCounter.classList.add("warn");
            }
        });
    }

    // ── 3. LÓGICA DE ENVÍO ────────────────────────────────────────────────────
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
            openModal(
                "error",
                "El portal permanece cerrado",
                "Debes rellenar todas las casillas obligatorias para que el mensaje pueda cruzar el portal."
            );
            return;
        }

        // Validación de formato de email
        const emailInput = form.querySelector('input[type="email"]');
        if (!emailRegex.test(emailInput.value.trim())) {
            openModal(
                "error",
                "Coordenadas incorrectas",
                "El formato del correo electrónico no es válido. Revisa la dirección e inténtalo de nuevo."
            );
            return;
        }

        // Longitud máxima de los campos (evita payloads enormes)
        const nombre = sanitizeInput(form.querySelector('[name="nombre"]').value);
        const apellidos = sanitizeInput(form.querySelector('[name="apellidos"]').value);
        const email = sanitizeInput(emailInput.value);
        const mensaje = sanitizeInput(form.querySelector('[name="mensaje"]').value);

        if (nombre.length > 100 || apellidos.length > 100) {
            openModal(
                "error",
                "Datos demasiado extensos",
                "El nombre o los apellidos superan los 100 caracteres permitidos."
            );
            return;
        }
        if (mensaje.length > 2000) {
            openModal(
                "error",
                "Mensaje demasiado largo",
                "El comentario supera los 2 000 caracteres. Por favor, resúmelo un poco."
            );
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
                nombre: nombre,
                apellidos: apellidos,
                email: email,
                mensaje: mensaje,
                // Honeypot: Formspree descarta el envío si este campo viene relleno
                _gotcha: form.querySelector('[name="_gotcha"]').value
            },
            dataType: "json",
            success: function () {
                form.reset();
                restaurarBoton();
                openModal(
                    "success",
                    "El mensaje ha cruzado el portal",
                    "Tu solicitud ha llegado a su destino. Nos pondremos en contacto contigo lo antes posible para darte acceso al libro."
                );
            },
            error: function () {
                restaurarBoton();
                openModal(
                    "error",
                    "El portal se ha cerrado",
                    "Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo en unos momentos."
                );
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